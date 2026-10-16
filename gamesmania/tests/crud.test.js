// tests/crud.test.js
// Teste de integracao do CRUD (inserir, listar, procurar por id, alterar,
// apagar) de categorias, produtos, usuarios e mensagens contra o banco
// SQLite real, alem de verificar a persistencia apos reiniciar o servidor.
// Rodar com:  npm test

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const PORT = 3199;
const BASE = `http://localhost:${PORT}`;
const DB_PATH = path.join(os.tmpdir(), `gamesmania-test-${process.pid}.db`);
let servidor;
let cookie = "";

function iniciarServidor() {
  return new Promise((resolve, reject) => {
    servidor = spawn("node", ["server.js"], {
      cwd: path.join(__dirname, ".."),
      env: { ...process.env, PORT: String(PORT), DB_PATH },
      stdio: ["ignore", "pipe", "inherit"]
    });
    servidor.stdout.on("data", (d) => {
      if (String(d).includes("rodando")) resolve();
    });
    servidor.on("error", reject);
  });
}

function pararServidor() {
  return new Promise((resolve) => {
    if (!servidor) return resolve();
    servidor.once("exit", resolve);
    servidor.kill();
  });
}

async function api(metodo, rota, corpo, comCookie = true) {
  const resp = await fetch(BASE + rota, {
    method: metodo,
    redirect: "manual",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(comCookie && cookie ? { Cookie: cookie } : {})
    },
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  const texto = await resp.text();
  let json = null;
  try { json = JSON.parse(texto); } catch (_) { /* resposta sem corpo */ }
  return { status: resp.status, json, headers: resp.headers };
}

before(async () => {
  await iniciarServidor();
  const r = await api("POST", "/login", { email: "admin@gamesmania.com", senha: "admin123" }, false);
  assert.equal(r.status, 200);
  cookie = r.headers.getSetCookie()[0].split(";")[0];
});

after(async () => {
  await pararServidor();
  for (const f of [DB_PATH, DB_PATH + "-wal", DB_PATH + "-shm"]) fs.rmSync(f, { force: true });
});

test("seed: catalogo inicial criado no banco", async () => {
  const cats = await api("GET", "/categorias");
  const prods = await api("GET", "/produtos");
  assert.equal(cats.json.length, 8);
  assert.equal(prods.json.length, 8);
});

test("categorias: inserir, listar, procurar por id, alterar, apagar", async () => {
  const criada = await api("POST", "/categorias", { nome: "Cadeiras", descricao: "Cadeiras gamer" });
  assert.equal(criada.status, 201);
  const id = criada.json.id;

  const lista = await api("GET", "/categorias");
  assert.ok(lista.json.some((c) => c.id === id));

  const um = await api("GET", `/categorias/${id}`);
  assert.equal(um.json.nome, "Cadeiras");

  const alt = await api("PUT", `/categorias/${id}`, { nome: "Cadeiras Pro" });
  assert.equal(alt.json.nome, "Cadeiras Pro");
  assert.equal(alt.json.descricao, "Cadeiras gamer"); // campo omitido preservado

  assert.equal((await api("DELETE", `/categorias/${id}`)).status, 204);
  assert.equal((await api("GET", `/categorias/${id}`)).status, 404);
});

test("produtos: inserir, listar, procurar por id, alterar, apagar", async () => {
  const criado = await api("POST", "/produtos", {
    nome: "Cadeira Gamer", preco: 899.9, categoriaId: 8, descricaoCurta: "Ergonomica"
  });
  assert.equal(criado.status, 201);
  const id = criado.json.id;

  assert.ok((await api("GET", "/produtos")).json.some((p) => p.id === id));
  assert.equal((await api("GET", `/tema/${id}`)).json.nome, "Cadeira Gamer");

  const alt = await api("PUT", `/produtos/${id}`, { preco: 799.9 });
  assert.equal(alt.json.preco, 799.9);
  assert.equal(alt.json.nome, "Cadeira Gamer");

  assert.equal((await api("DELETE", `/produtos/${id}`)).status, 204);
  assert.equal((await api("GET", `/tema/${id}`)).status, 404);
});

test("produtos: categoria inexistente e rejeitada (chave estrangeira)", async () => {
  const r = await api("POST", "/produtos", { nome: "X", preco: 1, categoriaId: 999, descricaoCurta: "x" });
  assert.equal(r.status, 400);
});

test("usuarios: inserir, listar, procurar por id, alterar, apagar", async () => {
  const criado = await api("POST", "/usuarios", {
    nome: "Maria Silva", email: "maria@teste.com", senha: "senha123", confirmarSenha: "senha123"
  }, false);
  assert.equal(criado.status, 201);
  assert.equal(criado.json.senhaHash, undefined); // hash nunca vaza
  const id = criado.json.id;

  assert.ok((await api("GET", "/usuarios")).json.some((u) => u.id === id));
  assert.equal((await api("GET", `/usuarios/${id}`)).json.email, "maria@teste.com");

  const alt = await api("PUT", `/usuarios/${id}`, { nome: "Maria Souza", email: "maria@teste.com" });
  assert.equal(alt.json.nome, "Maria Souza");

  // e-mail duplicado (sem diferenciar maiusculas)
  const dup = await api("POST", "/usuarios", {
    nome: "Outra", email: "MARIA@teste.com", senha: "senha123", confirmarSenha: "senha123"
  }, false);
  assert.equal(dup.status, 409);

  assert.equal((await api("DELETE", `/usuarios/${id}`)).status, 204);
  assert.equal((await api("GET", `/usuarios/${id}`)).status, 404);
});

test("mensagens: inserir, listar, procurar por id, apagar", async () => {
  const criada = await api("POST", "/contato", {
    nome: "Ana", email: "ana@teste.com", assunto: "Oi", mensagem: "Ola"
  }, false);
  assert.equal(criada.status, 201);
  const id = criada.json.id;

  assert.ok((await api("GET", "/mensagens")).json.some((m) => m.id === id));
  assert.equal((await api("GET", `/mensagens/${id}`)).json.assunto, "Oi");
  assert.equal((await api("DELETE", `/mensagens/${id}`)).status, 204);
  assert.equal((await api("GET", `/mensagens/${id}`)).status, 404);
});

test("persistencia: dados sobrevivem ao reinicio do servidor (sem duplicar o seed)", async () => {
  const criado = await api("POST", "/produtos", {
    nome: "Produto Persistente", preco: 10, categoriaId: 1, descricaoCurta: "fica no banco"
  });
  assert.equal(criado.status, 201);

  await pararServidor();
  await iniciarServidor();
  const r = await api("POST", "/login", { email: "admin@gamesmania.com", senha: "admin123" }, false);
  cookie = r.headers.getSetCookie()[0].split(";")[0];

  const prods = (await api("GET", "/produtos")).json;
  assert.ok(prods.some((p) => p.nome === "Produto Persistente"));
  assert.equal(prods.filter((p) => p.nome === "Mouse Gamer RGB").length, 1); // seed nao duplicou
  assert.equal((await api("GET", "/categorias")).json.length, 8);
});
