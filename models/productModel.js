// models/productModel.js
// Camada de Model: armazenamento e manipulacao dos PRODUTOS (temas) em memoria.

let produtos = [
  {
    id: 1,
    nome: "Mouse Gamer RGB",
    preco: 99.9,
    categoriaId: 1,
    imagem: "/imagens/mouse.svg",
    descricaoCurta: "Mouse sem fio 2.4GHz + Bluetooth 5.0 com iluminacao RGB recarregavel.",
    descricaoCompleta:
      "Mouse Gamer Sem Fio 2.4GHz + Bluetooth 5.0 RGB Recarregavel. Conexao versatil via 2.4GHz e Bluetooth 5.0, garantindo estabilidade e velocidade. Iluminacao RGB recarregavel que adiciona estilo e personalizacao. Design sem fio que liberta o jogador das limitacoes de cabos. Ideal para quem busca conexao versatil, iluminacao RGB e liberdade de movimento."
  },
  {
    id: 2,
    nome: "Teclado Gamer RGB",
    preco: 114.9,
    categoriaId: 2,
    imagem: "/imagens/teclado.svg",
    descricaoCurta: "Teclado mecanico com iluminacao RGB e teclas de resposta rapida.",
    descricaoCompleta:
      "Teclado Gamer RGB com switches de resposta rapida, iluminacao personalizavel e estrutura reforcada para uso intenso em partidas competitivas. Layout ABNT2 com teclas anti-ghosting para comandos simultaneos precisos."
  },
  {
    id: 3,
    nome: "Headset Gamer",
    preco: 145.9,
    categoriaId: 3,
    imagem: "/imagens/headset.svg",
    descricaoCurta: "Audio imersivo em 7.1 com microfone retratil para comunicacao em equipe.",
    descricaoCompleta:
      "Headset Gamer com audio surround 7.1, drivers de alta fidelidade e microfone retratil com cancelamento de ruido. Almofadas confortaveis para sessoes longas de jogo e conector P2 compativel com PC e consoles."
  },
  {
    id: 4,
    nome: "Mousepad XXL",
    preco: 89.9,
    categoriaId: 4,
    imagem: "/imagens/mousepad.svg",
    descricaoCurta: "Superficie extra grande com base antiderrapante para maxima precisao.",
    descricaoCompleta:
      "Mousepad XXL com superficie estendida para cobrir mouse e teclado, costura reforcada nas bordas e base de borracha antiderrapante. Textura otimizada para sensores oticos e a laser."
  },
  {
    id: 5,
    nome: "Controle Xbox",
    preco: 449.9,
    categoriaId: 5,
    imagem: "/imagens/controle.svg",
    descricaoCurta: "Controle sem fio compativel com Xbox e PC, com resposta precisa.",
    descricaoCompleta:
      "Controle sem fio oficial, compativel com Xbox Series X|S, Xbox One e PC via Bluetooth. Grip texturizado, gatilhos de resposta rapida e bateria de longa duracao."
  },
  {
    id: 6,
    nome: "Webcam HD",
    preco: 89.9,
    categoriaId: 6,
    imagem: "/imagens/webcam.svg",
    descricaoCurta: "Camera Full HD com microfone integrado para streaming e chamadas.",
    descricaoCompleta:
      "Webcam Full HD 1080p com foco automatico, correcao de luz e microfone integrado com reducao de ruido. Clipe universal compativel com monitores e notebooks."
  },
  {
    id: 7,
    nome: "Monitor Gamer",
    preco: 549.9,
    categoriaId: 7,
    imagem: "/imagens/monitor.svg",
    descricaoCurta: "Monitor com alta taxa de atualizacao e baixo tempo de resposta.",
    descricaoCompleta:
      "Monitor Gamer com taxa de atualizacao de 144Hz, tempo de resposta de 1ms e tecnologia de sincronizacao adaptativa para eliminar tearing. Painel com cores vivas e amplo angulo de visao."
  },
  {
    id: 8,
    nome: "Kit Gamer",
    preco: 299.9,
    categoriaId: 8,
    imagem: "/imagens/kit.svg",
    descricaoCurta: "Kit completo com mouse, teclado, headset e mousepad.",
    descricaoCompleta:
      "Kit Gamer completo reunindo mouse, teclado, headset e mousepad com iluminacao RGB combinavel. A forma ideal de montar um setup gamer com identidade visual unificada."
  }
];

let nextId = produtos.length + 1;

function getAll() {
  return produtos;
}

function getById(id) {
  return produtos.find((p) => p.id === Number(id));
}

function getByCategoria(categoriaId) {
  return produtos.filter((p) => p.categoriaId === Number(categoriaId));
}

function create({ nome, preco, categoriaId, imagem, descricaoCurta, descricaoCompleta }) {
  const novo = {
    id: nextId++,
    nome: String(nome || "").trim(),
    preco: Number(preco) || 0,
    categoriaId: Number(categoriaId) || null,
    imagem: imagem && String(imagem).trim() ? String(imagem).trim() : "/imagens/produto-padrao.svg",
    descricaoCurta: String(descricaoCurta || "").trim(),
    descricaoCompleta: String(descricaoCompleta || descricaoCurta || "").trim()
  };
  produtos.push(novo);
  return novo;
}

function update(id, dados) {
  const produto = getById(id);
  if (!produto) return null;
  if (dados.nome !== undefined) produto.nome = String(dados.nome).trim();
  if (dados.preco !== undefined) produto.preco = Number(dados.preco) || 0;
  if (dados.categoriaId !== undefined) produto.categoriaId = Number(dados.categoriaId) || null;
  if (dados.imagem !== undefined && String(dados.imagem).trim()) produto.imagem = String(dados.imagem).trim();
  if (dados.descricaoCurta !== undefined) produto.descricaoCurta = String(dados.descricaoCurta).trim();
  if (dados.descricaoCompleta !== undefined) produto.descricaoCompleta = String(dados.descricaoCompleta).trim();
  return produto;
}

function remove(id) {
  const index = produtos.findIndex((p) => p.id === Number(id));
  if (index === -1) return false;
  produtos.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, getByCategoria, create, update, remove };
