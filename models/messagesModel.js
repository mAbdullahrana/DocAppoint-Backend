const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
  },

  attachments: [
    {
      filename: String,
      originalname: String,
      mimeType: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatGroup",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Messages = mongoose.model("Messages", messagesSchema);

module.exports = Messages;
