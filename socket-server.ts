import { Server } from "socket.io";

export const io = new Server(Number(process.env.SOCKET_PORT), {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

io.on("connection", (socket) => {

  socket.on("join-room", (roomCode) => {
    socket.join(roomCode);

    io.to(roomCode).emit("room:members-updated", {
      message: `${socket.id} joined the room`,
    });
  });

  socket.on("server:room-ended", (roomCode) => {
    socket.to(roomCode).emit("room:ended");
  });

  socket.on("server:room-member-left", (roomCode) => {
    io.to(roomCode).emit("room:member-left");
  });

  socket.on("server:round-members-updated", (roomCode) => {
    io.to(roomCode).emit("round:members-updated");
  });

  socket.on("disconnect", () => {
  });
});