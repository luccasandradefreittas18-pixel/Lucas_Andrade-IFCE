// views/helpers.js
// Pequenas funcoes auxiliares usadas dentro dos templates .ejs.
// Sao registradas em app.locals (server.js), entao ficam disponiveis
// diretamente em qualquer arquivo .ejs sem precisar importar nada.

function formatarPreco(preco) {
  return Number(preco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

module.exports = { formatarPreco };
