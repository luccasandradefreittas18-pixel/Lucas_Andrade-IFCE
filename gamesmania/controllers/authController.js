// controllers/authController.js
const userModel = require("../models/userModel");
const { wantsJson } = require("./negotiate");
const { usuarioAtual } = require("../middlewares/auth");

// GET /login -> formulario de login
function loginForm(req, res) {
  if (usuarioAtual(req)) return res.redirect("/");
  res.render("pages/login", { proximo: req.query.proximo || "" });
}

// POST /login -> autentica e cria a sessao
function login(req, res) {
  const { email, senha } = req.body;
  const usuario = userModel.autenticar(email, senha);

  if (!usuario) {
    const erro = "E-mail ou senha incorretos.";
    if (wantsJson(req)) return res.status(401).json({ erro });
    return res.status(401).render("pages/login", { erro, email, proximo: req.query.proximo || "" });
  }

  req.session.usuario = userModel.publico(usuario);

  if (wantsJson(req)) return res.json({ mensagem: "Login efetuado", usuario: req.session.usuario });

  const proximo = req.query.proximo && String(req.query.proximo).startsWith("/") ? req.query.proximo : "/";
  res.redirect(proximo);
}

// POST /logout -> encerra a sessao
function logout(req, res) {
  const querJson = wantsJson(req);
  req.session.destroy(() => {
    if (querJson) return res.json({ mensagem: "Sessao encerrada" });
    res.redirect("/");
  });
}

// GET /recuperar-senha
function recuperarForm(req, res) {
  res.render("pages/recover-password");
}

// POST /recuperar-senha -> confirmacao (envio de e-mail nao implementado)
function recuperar(req, res) {
  const mensagem = "Se este e-mail estiver cadastrado, enviaremos as instrucoes de redefinicao.";
  if (wantsJson(req)) return res.json({ mensagem });
  res.render("pages/message", {
    titulo: "Verifique seu e-mail",
    mensagem,
    link: "/login",
    textoLink: "Voltar para o login"
  });
}

// GET /sessao -> quem esta logado (util para o front-end)
function sessao(req, res) {
  res.json({ usuario: usuarioAtual(req) });
}

module.exports = { loginForm, login, logout, recuperarForm, recuperar, sessao };
