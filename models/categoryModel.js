// models/categoryModel.js
// Camada de Model: armazenamento e manipulacao das CATEGORIAS em memoria.
// Em uma evolucao futura, isso poderia ser trocado por um banco de dados
// (ex: MongoDB, PostgreSQL) sem alterar Controller/View, pois a interface
// (os metodos exportados) permaneceria a mesma.

let categorias = [
  { id: 1, nome: "Mouses",     descricao: "Mouses gamers com alta precisao e resposta rapida" },
  { id: 2, nome: "Teclados",   descricao: "Teclados mecanicos e RGB para performance competitiva" },
  { id: 3, nome: "Headsets",   descricao: "Fones com audio imersivo e microfone para times" },
  { id: 4, nome: "Mousepads",  descricao: "Superficies de controle e velocidade para o setup" },
  { id: 5, nome: "Controles",  descricao: "Controles de video game para consoles e PC" },
  { id: 6, nome: "Webcams",    descricao: "Cameras HD para streaming e video chamadas" },
  { id: 7, nome: "Monitores",  descricao: "Monitores de alta taxa de atualizacao" },
  { id: 8, nome: "Kits",       descricao: "Kits completos de periféricos gamer" }
];

let nextId = categorias.length + 1;

function getAll() {
  return categorias;
}

function getById(id) {
  return categorias.find((c) => c.id === Number(id));
}

function create({ nome, descricao }) {
  const nova = {
    id: nextId++,
    nome: String(nome || "").trim(),
    descricao: String(descricao || "").trim()
  };
  categorias.push(nova);
  return nova;
}

function update(id, { nome, descricao }) {
  const categoria = getById(id);
  if (!categoria) return null;
  if (nome !== undefined) categoria.nome = String(nome).trim();
  if (descricao !== undefined) categoria.descricao = String(descricao).trim();
  return categoria;
}

function remove(id) {
  const index = categorias.findIndex((c) => c.id === Number(id));
  if (index === -1) return false;
  categorias.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
