const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const db = require("./db");
const publicRoutes = require("./routes/public");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

const app = express();

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
app.use("/perfil", adminRoutes);

// Endpoint para verificar sessão
app.get("/session", (req, res) => {
  if (!req.session.userId) return res.json({ logged: false });
  res.json({ logged: true, isAdmin: req.session.isAdmin });
});

// Página restrita: mapa
app.get("/mapa", (req, res) => {
  if (!req.session.userId) return res.redirect("/login?error=Por favor, faça login");

  const mapasDir = path.join(__dirname, "Mapas");
  fs.readdir(mapasDir, (err, files) => {
    if (err) return res.send("Erro ao ler mapas");

    const mapas = files.filter(f => f.endsWith(".html"));
    res.render("mapa", { mapas });
  });
});

// Servir arquivos da pasta Mapas
app.use("/mapaFiles", express.static(path.join(__dirname, "Mapas")));

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000 🚀"));
