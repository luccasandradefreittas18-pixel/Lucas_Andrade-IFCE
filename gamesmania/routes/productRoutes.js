// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { exigirAdmin } = require("../middlewares/auth");

// Rotas publicas
router.get("/tema/:id", productController.show);

// Rotas administrativas (exigem login de admin).
// Formularios ficam antes de "/:id" para nao serem interpretados como um id.
router.get("/produtos/novo", exigirAdmin, productController.newForm);
router.get("/produtos/:id/editar", exigirAdmin, productController.editForm);

router.get("/produtos", exigirAdmin, productController.index);
router.post("/produtos", exigirAdmin, productController.create);
router.put("/produtos/:id", exigirAdmin, productController.update);
router.delete("/produtos/:id", exigirAdmin, productController.destroy);

module.exports = router;
