import { Server } from "socket.io";
import { parse } from "cookie";
import { jwtVerify } from "jose";
import { isRoomOwnerByCode } from "./services/room.service";
import { isRoundRulerByCode } from "./services/round.service";

export const io = new Server(Number(process.env.SOCKET_PORT), {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    const cookies = parse(cookieHeader || "");
    const token = cookies.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!),
    );

    if (typeof payload.id !== "number") {
      return next(new Error("Unauthorized"));
    }

    socket.data.userId = payload.id;
    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId;

  socket.on("join-room", (roomCode) => {
    socket.join(roomCode);

    io.to(roomCode).emit("room:members-updated", {
      message: `${socket.id} joined the room`,
    });
  });

  socket.on("server:room-ended", async (roomCode) => {
    const isRoomOwner = await isRoomOwnerByCode(roomCode, userId);
    isRoomOwner && socket.to(roomCode).emit("room:ended");
  });

  socket.on("server:round-ended", async (roomCode) => {
    const isRoomOwner = await isRoomOwnerByCode(roomCode, userId);
    const isRoundRuler = await isRoundRulerByCode(roomCode, userId);
    (isRoomOwner || isRoundRuler) && socket.to(roomCode).emit("round:ended");
  });

  socket.on("server:room-member-left", (roomCode) => {
    io.to(roomCode).emit("room:member-left");
  });

  socket.on("server:round-started", (roomCode) => {
    io.to(roomCode).emit("round:started");
  });

  socket.on("server:round-ruler-updated", (roomCode) => {
    io.to(roomCode).emit("round:ruler-updated");
  });

  socket.on("round:player-word-updated", (roomCode, playerId: number) => {
    io.to(roomCode).emit("player:word-updated", playerId);
  });

  socket.on("round:card-used", (roomCode, userId: number, cardId: string) => {
    io.to(roomCode).emit("card:used", userId, cardId);
  });

  socket.on("disconnect", () => {});
});
