const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const db = require("./db");
const publicRoutes = require("./routes/public");
const authRoutes = require("./routes/auth");

const app = express();

// Configurações do EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessão
app.use(session({
  secret: "mapeia_secret",
  resave: false,
  saveUninitialized: true
}));

// Arquivos estáticos
app.use(express.static("public"));

// Rotas públicas
app.use("/", publicRoutes);

// Rotas de autenticação
app.use("/", authRoutes);

// Página restrita: mapa
app.get("/mapa", (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const mapasDir = path.join(__dirname, "Mapas");
  fs.readdir(mapasDir, (err, files) => {
    if (err) return res.send("Erro ao ler mapas");

    // Filtra apenas arquivos HTML
    const mapas = files.filter(f => f.endsWith(".html"));

    res.render("mapa", { mapas });
  });
});

// Servir arquivos da pasta Mapas
app.use("/mapaFiles", express.static(path.join(__dirname, "Mapas")));

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000 🚀");
});
