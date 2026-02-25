"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket/client";

type Player = { id: string; name: string; roomId: string; joinedAt: number };

export default function HomePage() {
  const [name, setName] = useState("super typer");
  const [roomId, setRoomId] = useState("global");
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();

    const onPlayers = (data: { players: Player[] }) => setPlayers(data.players);
    const onErr = (data: { message: string }) => setError(data.message);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => {
      setConnected(false);
      setIsJoined(false);
      setPlayers([]);
    };

    s.on("players:update", onPlayers);
    s.on("server:error", onErr);
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    // на случай если сокет уже подключен к моменту маунта
    setConnected(s.connected);

    return () => {
      s.off("players:update", onPlayers);
      s.off("server:error", onErr);
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, []);

  const join = () => {
    setError(null);
    getSocket().emit("player:join", { name, roomId });
    setIsJoined(true);
  };

  const leave = () => {
    getSocket().emit("player:leave");
    setPlayers([]);
    setIsJoined(false);
  };

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Typerace (MVP)</h1>
        <div className="text-sm">
          Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isJoined}
        />
        <input
          className="border rounded px-3 py-2"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          disabled={isJoined}
        />

        {!isJoined ? (
          <button
            className="border rounded px-4 py-2"
            onClick={join}
            disabled={!connected}
          >
            Join
          </button>
        ) : (
          <button className="border rounded px-4 py-2" onClick={leave}>
            Leave
          </button>
        )}
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="border rounded p-3">
        <div className="font-semibold mb-2">Players in room</div>
        {players.length === 0 ? (
          <div className="text-sm opacity-70">No players yet</div>
        ) : (
          <ul className="list-disc pl-5">
            {players.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
