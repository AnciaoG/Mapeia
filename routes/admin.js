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

// Perfil/controle
router.get("/", authRequired, (req, res) => {
  if (req.session.isAdmin) {
    // Admin vê todos os usuários
    db.all("SELECT nome, email, datetime(data_cadastro,'localtime') as cadastro FROM usuarios", [], (err, usuarios) => {
      if (err) return res.send("Erro ao buscar usuários");
      res.render("perfil", { usuario: null, usuarios, isAdmin: true });
    });
  } else {
    // Usuário normal vê apenas seus dados
    db.get("SELECT nome, email, datetime(data_cadastro,'localtime') as cadastro FROM usuarios WHERE id = ?", [req.session.userId], (err, usuario) => {
      if (err || !usuario) return res.send("Erro ao buscar usuário");
      res.render("perfil", { usuario, usuarios: null, isAdmin: false });
    });
  }
});

module.exports = router;
