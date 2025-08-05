const mongoose = require("mongoose");

const chatGroupSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  lastMessage: {
    type: String,
  
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ChatGroup = mongoose.model("ChatGroup", chatGroupSchema);

module.exports = ChatGroup;
