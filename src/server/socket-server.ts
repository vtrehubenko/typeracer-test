import { createServer } from "http";
import { Server } from "socket.io";
import { z } from "zod";
import { gameState } from "./game-state";

const PORT = Number(process.env.SOCKET_PORT ?? 3001);

const joinSchema = z.object({
  name: z.string().trim().min(1).max(24),
  roomId: z.string().trim().min(1).max(64),
});

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("player:join", (payload) => {
    const parsed = joinSchema.safeParse(payload);
    if (!parsed.success) {
      socket.emit("server:error", { message: "Invalid join payload" });
      return;
    }

    const { name, roomId } = parsed.data;

    socket.join(roomId);
    socket.data.roomId = roomId;
    gameState.join(roomId, {
      id: socket.id,
      name,
      roomId,
      joinedAt: Date.now(),
    });

    io.to(roomId).emit("players:update", {
      players: gameState.getPlayers(roomId),
    });
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue;
      gameState.leave(roomId, socket.id);
      io.to(roomId).emit("players:update", {
        players: gameState.getPlayers(roomId),
      });
    }
  });
  socket.on("player:leave", () => {
    const roomId = socket.data.roomId as string | undefined;
    if (!roomId) return;

    socket.leave(roomId);
    gameState.leave(roomId, socket.id);

    io.to(roomId).emit("players:update", {
      players: gameState.getPlayers(roomId),
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket server listening on http://localhost:${PORT}`);
});
