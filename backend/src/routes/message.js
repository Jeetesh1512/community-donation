const express = require("express");
const router = express.Router();
const {
  getMessagesByTransaction,
  sendMessage,
  markMessagesAsRead,
} = require("../controllers/message");

const { authMiddleware } = require("../middlewares/auth"); 

router.get("/getMessages/:transactionId", authMiddleware, getMessagesByTransaction);

router.post("/sendMessage/:transactionId", authMiddleware, sendMessage);

router.put("/markAsRead/:transactionId",authMiddleware,markMessagesAsRead);

module.exports = router;
