const Messages = require("../models/messagesModel");
const catchAsync = require("../util/catchAsync");
const { getIO } = require("../socket");
const { updateLastMessage } = require("./chatGroupController");
const multer = require("multer");
const AppError = require("../util/appError");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(
      null,
      `message-${req.user.id}-${Date.now()}-${file.originalname}.${ext}`
    );
  },
});

const multerFilter = (req, file, cb) => {
  const filter = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (filter.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

exports.uploadMessageAttachment = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.createMessage = catchAsync(async (req, res, next) => {
  const { chatId, text, sender } = req.body;

  let attachments = [];
  if (req.files && req.files.length > 0) {
    attachments = req.files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      mimeType: file.mimetype,
    }));
  }

  const newMessage = await Messages.create({
    sender,
    text,
    chatId,
    attachments,
  });

  await updateLastMessage(chatId, text);

  const messageToEmit = {
    _id: newMessage._id,
    text: text,
    attachment: newMessage.attachments,
    sender: newMessage.sender,
    timestamp: newMessage.createdAt,
    chatId: chatId,
  };

  const io = getIO();
  io.to(`chat_${chatId}`).emit("newMessage", messageToEmit);

  res.status(201).json({
    success: true,
    newMessage,
  });
});

exports.getMessagesByChatGroup = catchAsync(async (req, res, next) => {
  console.log("Chat ID:", req.params);
  const { chatId } = req.params;

  const messages = await Messages.find({ chatId: chatId })
    .populate("sender", "name email")
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    messages,
  });
});

exports.getLatestMessage = catchAsync(async (req, res, next) => {
  const { chatGroupId } = req.params;

  const latestMessage = await Messages.findOne({ chatGroup: chatGroupId })
    .populate("sender", "name email")
    .sort({ createdAt: -1 }); // Get the most recent message

  res.status(200).json({
    success: true,
    message: latestMessage,
  });
});
