const express = require("express");
const {
  createChatGroup,
  getUserChats,
  getChatById,
} = require("../controllers/chatGroupController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router.post("/create-chat-group", protect, createChatGroup);
router.get("/user-chats", protect, getUserChats);
router.get("/chat/:chatId", protect, getChatById);

module.exports = router;
