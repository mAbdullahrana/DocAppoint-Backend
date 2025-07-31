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

    // Add this event for both doctors and patients to join their own room
    socket.on("joinUserRoom", (userID) => {
      socket.join(`user_${userID}`);
      console.log(`User ${userID} joined room: user_${userID}`);
    });
    
    // Join doctor room for real-time appointment updates
    socket.on("joinDoctorRoom", (doctorID) => {
      socket.join(`doctor_${doctorID}`);
      console.log(`Doctor ${doctorID} joined room: doctor_${doctorID}`);
    });

    // Join patient room for real-time appointment updates
    socket.on("joinPatientRoom", (patientID) => {
      socket.join(`patient_${patientID}`);
      console.log(`Patient ${patientID} joined room: patient_${patientID}`);
    });

    // Legacy room joining (keep for backward compatibility)
    socket.on("joinRoom", (room) => {
      socket.join(room);
      socket.emit("joinedRoom", room);
    });

    socket.on("message", ({ room, msg }) => {
      // broadcast to others in room
      socket.to(room).emit("message", { msg, sender: socket.id });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

// For emitting outside of connection handler:
function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

module.exports = { initSocket, getIO };
