// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { exigirLogin, exigirAdmin } = require("../middlewares/auth");

// Cadastro publico ("Cadastre-se") - nao exige login.
router.get("/usuarios/novo", userController.newForm);
router.post("/usuarios", userController.create);

// Area administrativa.
router.get("/usuarios", exigirAdmin, userController.index);

// Edicao: exige login (o controller garante que so admin edita outros usuarios).
router.get("/usuarios/:id/editar", exigirLogin, userController.editForm);
router.put("/usuarios/:id", exigirLogin, userController.update);
router.delete("/usuarios/:id", exigirLogin, userController.destroy);

module.exports = router;
