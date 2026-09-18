// controllers/pageController.js
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const contactModel = require("../models/contactModel");
const { wantsJson } = require("./negotiate");

// GET / -> pagina inicial com lista dinamica de produtos (filtro opcional por categoria)
function home(req, res) {
  const categorias = categoryModel.getAll();
  const categoriaAtivaId = req.query.categoria ? Number(req.query.categoria) : null;
  const produtos = categoriaAtivaId
    ? productModel.getByCategoria(categoriaAtivaId)
    : productModel.getAll();

  if (wantsJson(req)) {
    return res.json({ produtos, categorias, categoriaAtivaId });
  }
  res.render("pages/home", { produtos, categorias, categoriaAtivaId });
}

// GET /autor
function autor(req, res) {
  if (wantsJson(req)) {
    return res.json({
      nome: "Lucas Andrade Freitas",
      nascimento: "1999-03-18",
      cidade: "Paraipaba - CE"
    });
  }
  res.render("pages/author");
}

// POST /contato -> recebe e armazena os dados do formulario de contato
function contato(req, res) {
  const { nome, email, assunto, mensagem } = req.body;
  if (!nome || !email || !assunto || !mensagem) {
    const erro = "Preencha todos os campos obrigatorios do formulario.";
    if (wantsJson(req)) return res.status(400).json({ erro });
    return res.status(400).render("pages/message", { titulo: "Dados incompletos", mensagem: erro });
  }
  const registro = contactModel.create({ nome, email, assunto, mensagem });
  if (wantsJson(req)) return res.status(201).json(registro);
  res.render("pages/message", {
    titulo: "Mensagem enviada!",
    mensagem: `Obrigado, ${nome}. Retornaremos pelo e-mail informado em breve.`
  });
}

module.exports = { home, autor, contato };
