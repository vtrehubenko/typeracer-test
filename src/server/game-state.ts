export type PlayerSession = {
  id: string;
  name: string;
  roomId: string;
  joinedAt: number;
  typed: string;
  wpm: number;
  accuracy: number;
};

export type RoundState = {
  id: string;
  sentence: string;
  startedAt: number;
  endsAt: number;
};

type RoomState = {
  roomId: string;
  players: Map<string, PlayerSession>; // key = socket.id
};

class GameState {
  private rooms = new Map<string, RoomState>();
  private rounds = new Map<string, RoundState>();

  getOrCreateRoom(roomId: string): RoomState {
    const existing = this.rooms.get(roomId);
    if (existing) return existing;

    const room: RoomState = { roomId, players: new Map() };
    this.rooms.set(roomId, room);
    return room;
  }

  join(roomId: string, player: PlayerSession) {
    const room = this.getOrCreateRoom(roomId);
    room.players.set(player.id, player);
  }

  leave(roomId: string, socketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.players.delete(socketId);
    if (room.players.size === 0) this.rooms.delete(roomId);
  }

  getPlayers(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.players.values());
  }
  setRound(roomId: string, round: RoundState) {
    this.rounds.set(roomId, round);
  }

  getRound(roomId: string) {
    return this.rounds.get(roomId);
  }

  updateTyped(roomId: string, socketId: string, typed: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const p = room.players.get(socketId);
    if (!p) return;
    p.typed = typed;
  }
  updateStats(
    roomId: string,
    socketId: string,
    stats: { wpm: number; accuracy: number },
  ) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const p = room.players.get(socketId);
    if (!p) return;
    p.wpm = stats.wpm;
    p.accuracy = stats.accuracy;
  }
}

export const gameState = new GameState();
