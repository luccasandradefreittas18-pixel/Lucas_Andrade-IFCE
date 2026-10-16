// middlewares/auth.js
// Middlewares de autenticacao usados pelas rotas administrativas.

const { wantsJson } = require("../controllers/negotiate");

// Disponibiliza o usuario logado para os controllers de forma padronizada.
function usuarioAtual(req) {
  return (req.session && req.session.usuario) || null;
}

// Bloqueia o acesso de quem nao esta logado.
function exigirLogin(req, res, next) {
  if (usuarioAtual(req)) return next();

  if (wantsJson(req)) {
    return res.status(401).json({ erro: "Autenticacao necessaria." });
  }
  const destino = encodeURIComponent(req.originalUrl);
  res.redirect(`/login?proximo=${destino}`);
}

// Bloqueia quem esta logado mas nao e administrador.
function exigirAdmin(req, res, next) {
  const usuario = usuarioAtual(req);
  if (usuario && usuario.papel === "admin") return next();

  if (!usuario) return exigirLogin(req, res, next);

  if (wantsJson(req)) {
    return res.status(403).json({ erro: "Acesso restrito a administradores." });
  }
  res.status(403).render("pages/message", {
    titulo: "403",
    mensagem: "Esta area e restrita a administradores.",
    link: "/",
    textoLink: "Voltar para o inicio"
  });
}

module.exports = { usuarioAtual, exigirLogin, exigirAdmin };
