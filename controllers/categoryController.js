// controllers/categoryController.js
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const { wantsJson } = require("./negotiate");
const { usuarioAtual } = require("../middlewares/auth");

function ehAdmin(req) {
  const usuario = usuarioAtual(req);
  return Boolean(usuario && usuario.papel === "admin");
}

// GET /categorias -> JSON publico (alimenta o filtro do catalogo) ou
// pagina de gerenciamento (somente admin).
function index(req, res) {
  const categorias = categoryModel.getAll();
  if (wantsJson(req)) return res.json(categorias);

  if (!ehAdmin(req)) return res.redirect("/login?proximo=%2Fcategorias");

  const produtos = productModel.getAll();
  res.render("pages/categories", { categorias, produtos });
}

// GET /categorias/:id
function show(req, res) {
  const categoria = categoryModel.getById(req.params.id);
  if (!categoria) {
    if (wantsJson(req)) return res.status(404).json({ erro: "Categoria nao encontrada" });
    return res.status(404).render("pages/404", { mensagem: "Categoria nao encontrada." });
  }
  if (wantsJson(req)) return res.json(categoria);
  res.redirect(`/?categoria=${categoria.id}`);
}

function newForm(req, res) {
  res.render("pages/category-form", {});
}

function editForm(req, res) {
  const categoria = categoryModel.getById(req.params.id);
  if (!categoria) return res.status(404).render("pages/404", { mensagem: "Categoria nao encontrada." });
  res.render("pages/category-form", { categoria });
}

function create(req, res) {
  if (!req.body.nome || !String(req.body.nome).trim()) {
    const erro = "O nome da categoria e obrigatorio.";
    if (wantsJson(req)) return res.status(400).json({ erro });
    return res.status(400).render("pages/categories", {
      categorias: categoryModel.getAll(),
      produtos: productModel.getAll(),
      erro
    });
  }
  const categoria = categoryModel.create(req.body);
  if (wantsJson(req)) return res.status(201).json(categoria);
  res.redirect("/categorias");
}

function update(req, res) {
  const existente = categoryModel.getById(req.params.id);
  if (!existente) {
    if (wantsJson(req)) return res.status(404).json({ erro: "Categoria nao encontrada" });
    return res.status(404).render("pages/404", { mensagem: "Categoria nao encontrada." });
  }
  if (req.body.nome !== undefined && !String(req.body.nome).trim()) {
    const erro = "O nome da categoria e obrigatorio.";
    if (wantsJson(req)) return res.status(400).json({ erro });
    return res.status(400).render("pages/category-form", { categoria: { ...existente, ...req.body }, erro });
  }
  const categoria = categoryModel.update(req.params.id, req.body);
  if (wantsJson(req)) return res.json(categoria);
  res.redirect("/categorias");
}

function destroy(req, res) {
  const emUso = productModel.getByCategoria(req.params.id).length;
  if (emUso > 0) {
    const erro = `Nao e possivel excluir: ${emUso} produto(s) usam esta categoria.`;
    if (wantsJson(req)) return res.status(409).json({ erro });
    return res.status(409).render("pages/message", {
      titulo: "Acao bloqueada",
      mensagem: erro,
      link: "/categorias",
      textoLink: "Voltar"
    });
  }
  const removido = categoryModel.remove(req.params.id);
  if (!removido) {
    if (wantsJson(req)) return res.status(404).json({ erro: "Categoria nao encontrada" });
    return res.status(404).render("pages/404", { mensagem: "Categoria nao encontrada." });
  }
  if (wantsJson(req)) return res.status(204).end();
  res.redirect("/categorias");
}

module.exports = { index, show, newForm, editForm, create, update, destroy };
