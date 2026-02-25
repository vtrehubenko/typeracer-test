export type PlayerSession = {
  id: string; // socket.id
  name: string;
  roomId: string;
  joinedAt: number;
};

type RoomState = {
  roomId: string;
  players: Map<string, PlayerSession>; // key = socket.id
};

class GameState {
  private rooms = new Map<string, RoomState>();

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
}

export const gameState = new GameState();
