const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const path = require("path");
const router = express.Router();

// Caminho base da pasta views
const viewsPath = path.resolve("views");

// Página de cadastro
router.get("/cadastro", (req, res) => {
  res.sendFile(path.join(viewsPath, "cadastro.html"));
});

// Cadastro POST
router.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) return res.send("Preencha todos os campos!");

  try {
    const hash = await bcrypt.hash(senha, 10);
    const query = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    db.run(query, [nome, email, hash], function(err) {
      if (err) return res.send("Erro ao cadastrar usuário: " + err.message);
      res.redirect("/login");
    });
  } catch (err) {
    return res.send("Erro no cadastro: " + err.message);
  }
});

// Página de login
router.get("/login", (req, res) => {
  res.sendFile(path.join(viewsPath, "login.html"));
});

// Login POST
router.post("/login", (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.send("Preencha todos os campos!");

  db.get("SELECT * FROM usuarios WHERE email = ?", [email], async (err, user) => {
    if (err) return res.send("Erro no banco de dados");
    if (!user) return res.send("Usuário não encontrado!");

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.send("Senha incorreta!");

    // Cria a sessão
    req.session.userId = user.id;

    // Registrar login
    const queryLogin = "INSERT INTO logins (usuario_id) VALUES (?)";
    db.run(queryLogin, [user.id], (err) => {
      if (err) console.log("Erro ao registrar login:", err.message);
    });

    res.redirect("/mapa");
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log("Erro ao encerrar sessão:", err);
    res.redirect("/");
  });
});

module.exports = router;
