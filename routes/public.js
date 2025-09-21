const express = require("express");
const path = require("path");
const router = express.Router();

// Home
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/home.html"));
});

// Equipe
router.get("/equipe", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/equipe.html"));
});

// Projeto
router.get("/projeto", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/projeto.html"));
});

module.exports = router;
