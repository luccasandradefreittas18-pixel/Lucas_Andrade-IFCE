// controllers/negotiate.js
// Pequeno utilitario de content negotiation reutilizado pelos controllers:
// se o cliente pede "Accept: application/json" respondemos JSON, senao HTML.

function wantsJson(req) {
  const preferido = req.accepts(["html", "json"]);
  return preferido === "json";
}

module.exports = { wantsJson };
