const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();

// ======================
// ROTA DE CADASTRO
// ======================
router.get("/cadastro", (req, res) => {
  res.sendFile("cadastro.html", { root: "./views" });
});

router.post("/cadastro", async (req, res) => {
  const { nome, email, senha, confirmSenha } = req.body;

  if (!nome || !email || !senha || !confirmSenha) {
    return res.redirect("/cadastro?error=Todos os campos são obrigatórios");
  }

  if (senha !== confirmSenha) {
    return res.redirect("/cadastro?error=Senhas não conferem");
  }

  try {
    const hash = await bcrypt.hash(senha, 10);

    // Por padrão, novo usuário é comum (isAdmin = 0)
    db.run(
      "INSERT INTO usuarios (nome, email, senha, isAdmin) VALUES (?, ?, ?, ?)",
      [nome, email, hash, 0],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.redirect("/cadastro?error=Email já cadastrado");
          }
          return res.redirect("/cadastro?error=Erro ao cadastrar usuário");
        }
        return res.redirect("/login?success=Cadastro realizado com sucesso");
      }
    );
  } catch (err) {
    return res.redirect("/cadastro?error=Erro ao cadastrar usuário");
  }
});

// ======================
// ROTA DE LOGIN
// ======================
router.get("/login", (req, res) => {
  res.sendFile("login.html", { root: "./views" });
});

router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) return res.redirect("/login?error=Preencha todos os campos");

  db.get("SELECT * FROM usuarios WHERE email = ?", [email], async (err, usuario) => {
    if (err || !usuario) return res.redirect("/login?error=Email ou senha inválidos");

    const valid = await bcrypt.compare(senha, usuario.senha);
    if (!valid) return res.redirect("/login?error=Email ou senha inválidos");

    req.session.userId = usuario.id;
    req.session.isAdmin = usuario.isAdmin === 1;

    db.run("INSERT INTO logins (usuario_id) VALUES (?)", [usuario.id]);

    // Redireciona conforme tipo de usuário
    if (usuario.isAdmin === 1) res.redirect("/admin");
    else res.redirect("/perfil");
  });
});

// ======================
// EXCLUIR PERFIL (usuário)
// ======================
router.post("/perfil/excluir", (req, res) => {
  if (!req.session.userId) return res.redirect("/login?error=Faça login primeiro");

  const userId = req.session.userId;

  // Excluir usuário
  db.run("DELETE FROM usuarios WHERE id = ?", [userId], function(err) {
    if (err) return res.send("Erro ao excluir usuário");

    // Encerrar sessão
    req.session.destroy(err => {
      if (err) return res.send("Erro ao finalizar sessão");
      res.redirect("/login?success=Perfil excluído com sucesso");
    });
  });
});


// ======================
// ROTA DE LOGOUT
// ======================
router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send("Erro ao fazer logout");
    res.redirect("/login?success=Logout realizado com sucesso");
  });
});

module.exports = router;
