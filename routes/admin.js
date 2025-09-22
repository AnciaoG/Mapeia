const express = require("express");
const db = require("../db");
const router = express.Router();

// Middleware de proteção
function authRequired(req, res, next) {
  if (!req.session.userId) return res.redirect("/login?error=Faça login primeiro");
  next();
}

function adminOnly(req, res, next) {
  if (!req.session.isAdmin) return res.send("Acesso negado: você não é administrador");
  next();
}

// Rota de controle do admin
router.get("/", authRequired, adminOnly, (req, res) => {
  // Buscar todos os usuários
  db.all("SELECT id, nome, email, datetime(data_cadastro,'localtime') as cadastro FROM usuarios", [], (err, usuarios) => {
    if (err) return res.send("Erro ao buscar usuários");
    res.render("admin", { usuarios });
  });
});

// Excluir usuário (admin)
router.post("/excluir/:id", authRequired, adminOnly, (req, res) => {
  const userId = req.params.id;

  db.run("DELETE FROM usuarios WHERE id = ?", [userId], function(err) {
    if (err) return res.send("Erro ao excluir usuário");
    res.redirect("/admin");
  });
});

module.exports = router;
