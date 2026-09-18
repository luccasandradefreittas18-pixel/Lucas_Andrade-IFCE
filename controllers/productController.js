// controllers/productController.js
// Camada de Controller: recebe a requisicao, fala com o Model e decide
// se a resposta sera JSON (content negotiation) ou uma pagina .ejs renderizada.

const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const { wantsJson } = require("./negotiate");

// GET /produtos -> pagina de cadastro/gerenciamento ou lista em JSON
function index(req, res) {
  const produtos = productModel.getAll();
  if (wantsJson(req)) {
    return res.json(produtos);
  }
  const categorias = categoryModel.getAll();
  res.render("pages/products-admin", { produtos, categorias });
}

// GET /tema/:id -> pagina de detalhes de um produto ("tema")
function show(req, res) {
  const produto = productModel.getById(req.params.id);
  if (!produto) {
    if (wantsJson(req)) return res.status(404).json({ erro: "Produto nao encontrado" });
    return res.status(404).render("pages/404", { mensagem: "Produto nao encontrado." });
  }
  if (wantsJson(req)) {
    return res.json(produto);
  }
  const categoria = categoryModel.getById(produto.categoriaId);
  res.render("pages/product", { produto, categoria });
}

// GET /produtos/novo -> formulario de cadastro isolado
function newForm(req, res) {
  const categorias = categoryModel.getAll();
  res.render("pages/product-form", { categorias });
}

// GET /produtos/:id/editar -> formulario de edicao preenchido
function editForm(req, res) {
  const produto = productModel.getById(req.params.id);
  if (!produto) return res.status(404).render("pages/404", { mensagem: "Produto nao encontrado." });
  const categorias = categoryModel.getAll();
  res.render("pages/product-form", { produto, categorias });
}

function validarDados(dados) {
  if (!dados.nome || !String(dados.nome).trim()) return "O nome do produto e obrigatorio.";
  if (dados.preco === undefined || Number.isNaN(Number(dados.preco)) || Number(dados.preco) < 0)
    return "Informe um preco valido.";
  if (!dados.categoriaId) return "Selecione uma categoria.";
  if (!dados.descricaoCurta || !String(dados.descricaoCurta).trim()) return "A descricao curta e obrigatoria.";
  return null;
}

// POST /produtos -> cria um novo produto a partir dos dados do formulario
function create(req, res) {
  const erro = validarDados(req.body);
  if (erro) {
    if (wantsJson(req)) return res.status(400).json({ erro });
    return res.status(400).render("pages/products-admin", {
      produtos: productModel.getAll(),
      categorias: categoryModel.getAll(),
      erro,
      valores: req.body
    });
  }
  const produto = productModel.create(req.body);
  if (wantsJson(req)) return res.status(201).json(produto);
  res.redirect("/produtos");
}

// PUT /produtos/:id -> atualiza um produto existente
function update(req, res) {
  const existente = productModel.getById(req.params.id);
  if (!existente) {
    if (wantsJson(req)) return res.status(404).json({ erro: "Produto nao encontrado" });
    return res.status(404).render("pages/404", { mensagem: "Produto nao encontrado." });
  }
  const erro = validarDados({ ...existente, ...req.body });
  if (erro) {
    if (wantsJson(req)) return res.status(400).json({ erro });
    const categorias = categoryModel.getAll();
    return res.status(400).render("pages/product-form", {
      produto: { ...existente, ...req.body, id: existente.id },
      categorias,
      erro
    });
  }
  const produto = productModel.update(req.params.id, req.body);
  if (wantsJson(req)) return res.json(produto);
  res.redirect(`/tema/${produto.id}`);
}

// DELETE /produtos/:id -> remove um produto
function destroy(req, res) {
  const removido = productModel.remove(req.params.id);
  if (!removido) {
    if (wantsJson(req)) return res.status(404).json({ erro: "Produto nao encontrado" });
    return res.status(404).render("pages/404", { mensagem: "Produto nao encontrado." });
  }
  if (wantsJson(req)) return res.status(204).end();
  res.redirect("/produtos");
}

module.exports = { index, show, newForm, editForm, create, update, destroy };
