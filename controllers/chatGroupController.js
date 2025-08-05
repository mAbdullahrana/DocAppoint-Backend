const ChatGroup = require("../models/chatGroupModel");
const catchAsync = require("../util/catchAsync");

exports.createChatGroup = catchAsync(async (req, res, next) => {
  const sender = req.user._id;
  const { receiverId } = req.body;

  // Check if a chat group already exists between these users
  const existingChat = await ChatGroup.findOne({
    $or: [
      { sender: sender, receiver: receiverId },
      { sender: receiverId, receiver: sender },
    ],
  });

  if (existingChat) {
    return res.status(200).json({
      success: true,
      chatGroup: existingChat,
      message: "Chat group already exists",
    });
  }

  const chatGroup = await ChatGroup.create({
    sender,
    receiver: receiverId,
  });

  res.status(201).json({
    success: true,
    chatGroup,
  });
});

exports.getUserChats = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const chats = await ChatGroup.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .populate("sender", "name email")
    .populate("receiver", "name email");

  console.log(chats);
  res.status(200).json({
    success: true,
    chats,
  });
});

exports.getChatById = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  const chat = await ChatGroup.findById(chatId)
    .populate("sender", "name email")
    .populate("receiver", "name email");

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: "Chat not found",
    });
  }

  res.status(200).json({
    success: true,
    chat,
  });
});

exports.updateLastMessage = catchAsync(async (chatGroupId, message) => {
  await ChatGroup.findByIdAndUpdate(chatGroupId, {
    lastMessage: message,
  });
});
