// server.js
// Ponto de entrada da aplicacao Express, seguindo o padrao MVC:
//
//   Model       -> models/*.js
//   View        -> views/pages/*.ejs
//   Controller  -> controllers/*.js
//   Routes      -> routes/*.js
//   Middlewares -> middlewares/*.js

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

// =====================================================
// VIEW ENGINE (EJS)
// =====================================================

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


// =====================================================
// HELPERS
// =====================================================

app.locals.formatarPreco = formatarPreco;


// =====================================================
// MIDDLEWARES
// =====================================================

// Recebe dados enviados por formularios HTML
app.use(express.urlencoded({ extended: true }));

// Recebe dados enviados em JSON
app.use(express.json());


// =====================================================
// SESSAO
// =====================================================

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "gamesmania-segredo-de-desenvolvimento",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8 // 8 horas
    }
  })
);


// =====================================================
// USUARIO ATUAL
// =====================================================

// Disponibiliza o usuario logado para os templates
app.use((req, res, next) => {
  res.locals.usuario = usuarioAtual(req);
  next();
});


// =====================================================
// LOGGER DE NAVEGAÇÃO E FORMULÁRIOS
// =====================================================

const camposSensiveis = [
  "senha",
  "password",
  "senhaAtual",
  "novaSenha",
  "confirmarSenha",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "secret"
];

function esconderDadosSensiveis(dados) {
  if (!dados || typeof dados !== "object") {
    return dados;
  }

  const dadosSeguros = {};

  for (const chave in dados) {
    if (
      camposSensiveis.some(
        campo => campo.toLowerCase() === chave.toLowerCase()
      )
    ) {
      dadosSeguros[chave] = "[OCULTO]";
    } else {
      dadosSeguros[chave] = dados[chave];
    }
  }

  return dadosSeguros;
}


app.use((req, res, next) => {

  // Só registra:
  // GET  -> páginas
  // POST -> formulários
  // PUT  -> alterações
  // DELETE -> exclusões
  //
  // Ignora arquivos como:
  // .js, .css, .png, .jpg, .jpeg, .gif, .svg, .ico, etc.

  const extensaoArquivo = /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|map)$/i;

  if (extensaoArquivo.test(req.path)) {
    return next();
  }

  // Também ignora requisições de arquivos da pasta public
  if (
    req.path.startsWith("/js/") ||
    req.path.startsWith("/css/") ||
    req.path.startsWith("/images/") ||
    req.path.startsWith("/img/") ||
    req.path.startsWith("/fonts/")
  ) {
    return next();
  }

  const inicio = Date.now();

  const usuario = usuarioAtual(req);

  let usuarioLogado = "Visitante";

  if (usuario) {
    usuarioLogado =
      usuario.nome ||
      usuario.email ||
      usuario.usuario ||
      "Usuário logado";
  }

  res.on("finish", () => {

    const tempo = Date.now() - inicio;

    console.log("");
    console.log("==================================================");
    console.log("             GAMESMANIA - REQUISIÇÃO");
    console.log("==================================================");

    console.log("Data/Hora:", new Date().toLocaleString());
    console.log("Método:", req.method);
    console.log("Rota:", req.originalUrl);
    console.log("IP:", req.ip);
    console.log("Usuário:", usuarioLogado);
    console.log("Status:", res.statusCode);
    console.log("Tempo:", `${tempo} ms`);

    // Mostrar dados somente em requisições que podem
    // enviar informações para o servidor
    if (
      req.method === "POST" ||
      req.method === "PUT" ||
      req.method === "PATCH" ||
      req.method === "DELETE"
    ) {
      const dados = esconderDadosSensiveis(req.body);

      if (dados && Object.keys(dados).length > 0) {
        console.log("Dados recebidos:", dados);
      } else {
        console.log("Dados recebidos: nenhum");
      }
    }

    console.log("==================================================");
    console.log("");
  });

  next();
});


// =====================================================
// METHOD OVERRIDE
// =====================================================

// Permite que formularios HTML simulem PUT e DELETE
app.use(
  methodOverride((req) => {
    if (req.query && req.query._method) {
      return req.query._method;
    }

    if (req.body && req.body._method) {
      const metodo = req.body._method;

      delete req.body._method;

      return metodo;
    }

    return undefined;
  })
);


// =====================================================
// ARQUIVOS ESTATICOS
// =====================================================

app.use(express.static(path.join(__dirname, "public")));


// =====================================================
// ROTAS
// =====================================================

app.use(pageRoutes);

app.use(authRoutes);

app.use(userRoutes);

app.use(productRoutes);

app.use(categoryRoutes);


// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  res.status(404).render("pages/404");
});


// =====================================================
// TRATAMENTO DE ERROS
// =====================================================

app.use((err, req, res, next) => {
  console.error("");
  console.error("====================================");
  console.error("ERRO NO SERVIDOR");
  console.error("====================================");
  console.error(err);
  console.error("====================================");
  console.error("");

  res.status(500).render("pages/message", {
    titulo: "Erro interno",
    mensagem: "Algo deu errado ao processar sua requisicao."
  });
});


// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {
  console.log("");
  console.log("====================================");
  console.log("       GAMESMANIA - SERVIDOR");
  console.log("====================================");
  console.log(`Servidor: http://localhost:${PORT}`);
  console.log("Login inicial: admin@gamesmania.com / admin123");
  console.log("====================================");
  console.log("");
});


module.exports = app;

