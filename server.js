const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const db = require("./db");
const publicRoutes = require("./routes/public");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

const app = express();

// Configuração do template engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: "mapeia_secret",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));
app.use(express.static("public"));

// Rotas
app.use("/", publicRoutes);
app.use("/", authRoutes);
app.use("/admin", adminRoutes);

// Endpoint para verificar sessão
app.get("/session", (req, res) => {
  res.json({
    logged: !!req.session.userId,
    isAdmin: req.session.isAdmin || false
  });
});

// Página do perfil para usuários
app.get("/perfil", (req, res) => {
  if (!req.session.userId) return res.redirect("/login?error=Faça login para acessar o perfil");

  db.get("SELECT id, nome, email, data_cadastro AS cadastro, isAdmin FROM usuarios WHERE id = ?", [req.session.userId], (err, usuario) => {
    if (err || !usuario) return res.redirect("/login?error=Usuário não encontrado");
    res.render("perfil", { usuario, isAdmin: false });
  });
});

// Página admin (listar todos os usuários)
app.get("/admin", (req, res) => {
  if (!req.session.userId || !req.session.isAdmin) return res.redirect("/login?error=Acesso negado");

  db.all("SELECT id, nome, email, data_cadastro AS cadastro FROM usuarios", [], (err, usuarios) => {
    if (err) return res.send("Erro ao carregar usuários");
    res.render("admin", { usuarios, isAdmin: true });
  });
});

// Página restrita: mapa
app.get("/mapa", (req, res) => {
  if (!req.session.userId) return res.redirect("/login?error=É necessário estar logado para acessar os mapas");

  // Defina os mapas com título, descrição e caminho do arquivo
  const mapas = [
    { titulo: "Mapa de Coelho Neto", descricao: "Mostra uma imagem de satélite de Coelho Neto", arquivo: "qgis2web_2025_09_20-22_17_46_811048/index.html" },
    { titulo: "Mapa do Maranhão", descricao: "Mostra uma imagem de satélite do Maranhão com ponto de origem em Coelho Neto", arquivo: "qgis2web_2025_09_20-22_20_12_291843/index.html" },
    { titulo: "Mapa de Coelho Neto", descricao: "Imagem de satélite de Coelho Neto", arquivo: "qgis2web_2025_09_20-22_21_15_989380/index.html" },
    { titulo: "Mapa dos Setores Censitários", descricao: "Mostra os setores censitários de Coelho Neto de 2010 e 2022", arquivo: "qgis2web_2025_09_20-22_23_09_325081/index.html" }
  ];

  res.render("mapa", { mapas });
});

// Servir arquivos da pasta Mapas
app.use("/mapaFiles", express.static(path.join(__dirname, "Mapas")));

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000 🚀"));
