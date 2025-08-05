const { Server } = require("socket.io");




let io;
function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    },
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // For doctors and patients to join their own room to show live Appointments
    socket.on("joinUserRoom", (userID) => {
      socket.join(`user_${userID}`);
      console.log(`User ${userID} joined room: user_${userID}`);
    });

    // Join chat room
    socket.on("joinChatRoom", (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User joined chat room: chat_${chatId}`);
      socket.emit("joinedChatRoom", chatId);
    });

    // socket.on("sendMessage", async (messageData) => {
    //   console.log("messageData from socket", messageData);
    //   if (
    //     !messageData.chatId ||
    //     !messageData.sender ||
    //     !(messageData.text || messageData.attachment)
    //   ) {
    //     console.error("Invalid message data:", messageData);
    //     return;
    //   }

    //   try {
    //     const newMessage = await createMessage(messageData);

    //     if (!newMessage) {
    //       console.error("Failed to create message: newMessage is undefined");
    //       return;
    //     }

    //     const { chatId, text, attachment, sender, createdAt, _id } = newMessage;

    //     await updateLastMessage(chatId, text);

    //     const messageToEmit = {
    //       _id: _id,
    //       text: text,
    //       attachment: attachment,
    //       sender: sender,
    //       timestamp: createdAt,
    //       chatId: chatId,
    //     };

    //     socket.to(`chat_${chatId}`).emit("receiveMessage", messageToEmit);
    //   } catch (error) {
    //     console.error("Error in sendMessage:", error);
    //   }
    // });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

module.exports = { initSocket, getIO };
