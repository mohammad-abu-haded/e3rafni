import { Server } from "socket.io";

export const io = new Server(Number(process.env.SOCKET_PORT), {
  cors: {
    origin: process.env.CLIENT_URL,
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

  socket.on("server:round-ruler-selected", (roomCode) => {
    io.to(roomCode).emit("round:ruler-selected");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

console.log(`Socket.IO server running on port ${process.env.SOCKET_PORT}`);
