// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/login", authController.loginForm);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/sessao", authController.sessao);
router.get("/recuperar-senha", authController.recuperarForm);
router.post("/recuperar-senha", authController.recuperar);

module.exports = router;
