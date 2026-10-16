// db/seed.js
// Popula o banco com os dados iniciais (catalogo de exemplo + usuario admin)
// SOMENTE quando as tabelas estao vazias. Em execucoes seguintes os dados ja
// existentes sao preservados.

const db = require("./database");
const dados = require("./seed-data.json");
const userModel = require("../models/userModel");

function semear() {
  const total = (tabela) => db.prepare(`SELECT COUNT(*) AS n FROM ${tabela}`).get().n;

  if (total("categorias") === 0) {
    const ins = db.prepare("INSERT INTO categorias (id, nome, descricao) VALUES (@id, @nome, @descricao)");
    db.transaction((lista) => lista.forEach((c) => ins.run(c)))(dados.categorias);
  }

  if (total("produtos") === 0) {
    const ins = db.prepare(
      `INSERT INTO produtos (id, nome, preco, categoriaId, imagem, descricaoCurta, descricaoCompleta)
       VALUES (@id, @nome, @preco, @categoriaId, @imagem, @descricaoCurta, @descricaoCompleta)`
    );
    db.transaction((lista) => lista.forEach((p) => ins.run(p)))(dados.produtos);
  }

  if (total("usuarios") === 0) {
    userModel.create({
      nome: "Lucas Andrade Freitas",
      endereco: "Rua Principal, 00 - Paraipaba/CE",
      email: "admin@gamesmania.com",
      telefone: "(85) 00000-0000",
      senha: "admin123",
      papel: "admin"
    });
  }
}

module.exports = { semear };
