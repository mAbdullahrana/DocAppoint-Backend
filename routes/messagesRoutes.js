const express = require("express");

const {
  createMessage,
  getMessagesByChatGroup,
  getLatestMessage,
  uploadMessageAttachment,
} = require("../controllers/messagesController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/create-message",
  protect,
  uploadMessageAttachment.array("attachments", 5),
  createMessage
);
router.get("/chat-group/:chatId", protect, getMessagesByChatGroup);
router.get("/chat-group/:chatGroupId/latest", protect, getLatestMessage);

module.exports = router;
