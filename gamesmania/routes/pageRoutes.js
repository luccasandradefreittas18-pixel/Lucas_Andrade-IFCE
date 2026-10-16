// routes/pageRoutes.js
const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");

router.get("/", pageController.home);
router.get("/autor", pageController.autor);
router.post("/contato", pageController.contato);

module.exports = router;
