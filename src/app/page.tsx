"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket/client"; // если без src, путь будет "../lib/socket/client" не через @

type Player = { id: string; name: string; roomId: string; joinedAt: number };

export default function HomePage() {
  const [name, setName] = useState("super typer");
  const [roomId, setRoomId] = useState("global");
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = getSocket();

    const onPlayers = (data: { players: Player[] }) => setPlayers(data.players);
    const onErr = (data: { message: string }) => setError(data.message);

    s.on("players:update", onPlayers);
    s.on("server:error", onErr);

    return () => {
      s.off("players:update", onPlayers);
      s.off("server:error", onErr);
    };
  }, []);

  const join = () => {
    setError(null);
    getSocket().emit("player:join", { name, roomId });
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Typerace (MVP)</h1>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button className="border rounded px-4 py-2" onClick={join}>
          Join
        </button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="border rounded p-3">
        <div className="font-semibold mb-2">Players in room</div>
        <ul className="list-disc pl-5">
          {players.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
