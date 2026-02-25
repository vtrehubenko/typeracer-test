import { createServer } from "http";
import { Server } from "socket.io";
import { z } from "zod";
import { randomUUID } from "crypto";
import { gameState } from "./game-state";
import { getRandomSentence } from "./sentences";
import { computeMetrics } from "./metrics";

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

const ROUND_MS = 30_000;
const startedAt = Date.now();
const roomLoops = new Map<string, NodeJS.Timeout>();

function emitRound(roomId: string) {
  const startedAt = Date.now();
  const round = {
    id: randomUUID(),
    sentence: getRandomSentence(),
    startedAt,
    endsAt: startedAt + ROUND_MS,
  };

  gameState.setRound(roomId, round);

  for (const p of gameState.getPlayers(roomId)) {
    gameState.updateTyped(roomId, p.id, "");
    gameState.updateStats(roomId, p.id, { wpm: 0, accuracy: 1 });
  }

  io.to(roomId).emit("round:start", round);
  io.to(roomId).emit("players:update", {
    players: gameState.getPlayers(roomId),
  });
}

function ensureRoomLoop(roomId: string) {
  if (roomLoops.has(roomId)) return;

  emitRound(roomId);

  const t = setInterval(() => {
    if (gameState.getPlayers(roomId).length === 0) {
      clearInterval(t);
      roomLoops.delete(roomId);
      return;
    }
    emitRound(roomId);
  }, ROUND_MS);

  roomLoops.set(roomId, t);
}

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
      typed: "",
      wpm: 0,
      accuracy: 1,
    });

    ensureRoomLoop(roomId);

    const existingRound = gameState.getRound(roomId);
    if (existingRound) socket.emit("round:start", existingRound);

    io.to(roomId).emit("players:update", {
      players: gameState.getPlayers(roomId),
    });
  });

  socket.on("player:leave", () => {
    const roomId = socket.data.roomId as string | undefined;
    if (!roomId) return;

    socket.leave(roomId);
    gameState.leave(roomId, socket.id);
    if (gameState.getPlayers(roomId).length === 0) {
      const t = roomLoops.get(roomId);
      if (t) clearInterval(t);
      roomLoops.delete(roomId);
    }

    io.to(roomId).emit("players:update", {
      players: gameState.getPlayers(roomId),
    });
  });
  socket.on("player:progress", (payload: { typed: string }) => {
    const roomId = socket.data.roomId as string | undefined;
    if (!roomId) return;

    const round = gameState.getRound(roomId);
    if (!round) return;

    const typed = typeof payload?.typed === "string" ? payload.typed : "";

    gameState.updateTyped(roomId, socket.id, typed);

    const stats = computeMetrics({
      sentence: round.sentence,
      typed,
      startedAt: round.startedAt,
      now: Date.now(),
    });

    gameState.updateStats(roomId, socket.id, stats);

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
});

httpServer.listen(PORT, () => {
  console.log(`Socket server listening on http://localhost:${PORT}`);
});
