import { Server } from "socket.io";

const io = new Server(3001, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-room", (roomCode) => {
    socket.join(roomCode);

    console.log(`${socket.id} joined room ${roomCode}`);

    io.to(roomCode).emit("room:members-updated", {
      message: `${socket.id} joined the room`,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

console.log("Socket.IO server running on port 3001");
