// server.js
// Ponto de entrada da aplicacao Express, seguindo o padrao MVC:
//   Model       -> models/*.js         (dados e regras de armazenamento)
//   View        -> views/pages/*.ejs   (templates HTML, com partials/ para
//                                        cabecalho/rodape compartilhados)
//   Controller  -> controllers/*.js    (logica das rotas: GET/POST/PUT/DELETE)
//   Routes      -> routes/*.js         (mapeamento das rotas Express -> Controller)
//   Middlewares -> middlewares/*.js    (autenticacao das areas administrativas)

const path = require("path");
const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");

const { formatarPreco } = require("./views/helpers");
const { usuarioAtual } = require("./middlewares/auth");

const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// --- View engine (EJS) ---
// Os arquivos .ejs ficam em views/pages/*.ejs; views/partials/*.ejs contem o
// cabecalho, o menu e o rodape compartilhados por todas as paginas.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Helpers e dados disponiveis em QUALQUER template, sem precisar repetir em
// cada chamada de res.render(...).
app.locals.formatarPreco = formatarPreco;

// --- Middlewares ---
app.use(express.urlencoded({ extended: true })); // dados de <form>
app.use(express.json()); // corpo JSON (util para clientes/API)

// Sessao usada pelo login. Em producao, troque o secret por uma variavel
// de ambiente e use cookie.secure com HTTPS.
app.use(
  session({
    secret: process.env.SESSION_SECRET || "gamesmania-segredo-de-desenvolvimento",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 } // 8 horas
  })
);

// Disponibiliza o usuario logado (ou null) para todos os templates via
// "usuario", sem precisar passar isso manualmente em cada res.render(...).
app.use((req, res, next) => {
  res.locals.usuario = usuarioAtual(req);
  next();
});

// Permite que formularios HTML (que so suportam GET/POST) simulem PUT e
// DELETE atraves de ?_method=PUT|DELETE ou de um campo oculto "_method".
app.use(
  methodOverride((req) => {
    if (req.query && req.query._method) return req.query._method;
    if (req.body && req.body._method) {
      const metodo = req.body._method;
      delete req.body._method;
      return metodo;
    }
    return undefined;
  })
);

app.use(express.static(path.join(__dirname, "public")));

// --- Rotas ---
app.use(pageRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(productRoutes);
app.use(categoryRoutes);

// --- 404 ---
app.use((req, res) => {
  res.status(404).render("pages/404");
});

// --- Tratamento de erros ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("pages/message", {
    titulo: "Erro interno",
    mensagem: "Algo deu errado ao processar sua requisicao."
  });
});

app.listen(PORT, () => {
  console.log(`GAMESMANIA rodando em http://localhost:${PORT}`);
  console.log(`Login inicial: admin@gamesmania.com / admin123`);
});

module.exports = app;
