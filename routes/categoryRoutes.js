// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { exigirAdmin } = require("../middlewares/auth");

// A listagem de categorias em JSON e publica (alimenta o filtro do catalogo);
// a pagina de gerenciamento e o CRUD exigem admin.
router.get("/categorias/novo", exigirAdmin, categoryController.newForm);
router.get("/categorias/:id/editar", exigirAdmin, categoryController.editForm);

router.get("/categorias", categoryController.index);
router.get("/categorias/:id", categoryController.show);

router.post("/categorias", exigirAdmin, categoryController.create);
router.put("/categorias/:id", exigirAdmin, categoryController.update);
router.delete("/categorias/:id", exigirAdmin, categoryController.destroy);

module.exports = router;
