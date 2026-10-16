// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { exigirAdmin } = require("../middlewares/auth");

router.get("/mensagens", exigirAdmin, messageController.index);
router.get("/mensagens/:id", exigirAdmin, messageController.show);
router.delete("/mensagens/:id", exigirAdmin, messageController.destroy);

module.exports = router;
