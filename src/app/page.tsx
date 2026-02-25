"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket/client";
import { PlayersTable } from "@/components/PlayersTable";

type Player = {
  id: string;
  name: string;
  roomId: string;
  joinedAt: number;
  typed: string;
  wpm: number;
  accuracy: number;
};

export default function HomePage() {
  const [name, setName] = useState("super typer");
  const [roomId, setRoomId] = useState("global");
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sentence, setSentence] = useState("");
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const onRoundStart = (round: { sentence: string; endsAt: number }) => {
      setSentence(round.sentence);
      setEndsAt(round.endsAt);
      setTyped("");
    };
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
    s.on("round:start", onRoundStart);

    setConnected(s.connected);

    return () => {
      s.off("players:update", onPlayers);
      s.off("server:error", onErr);
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("round:start", onRoundStart);
    };
  }, []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
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
  const handleTyping = (value: string) => {
    setTyped(value);

    const s = getSocket();
    if (s.connected) {
      s.emit("player:progress", { typed: value });
    }
  };
  const timeLeft = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : 0;

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
        <div className="font-semibold mb-2">Current sentence</div>
        <div className="mb-2">{sentence || "—"}</div>
        <div className="text-sm opacity-80">Time left: {timeLeft}s</div>
      </div>
      {isJoined && (
        <input
          className="border rounded px-3 py-2 w-full mt-3"
          value={typed}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Start typing..."
        />
      )}

      <div className="border rounded p-3">
        <div className="font-semibold mb-2">Players in room</div>
        {players.length === 0 ? (
          <div className="text-sm opacity-70">No players yet</div>
        ) : (
          <ul className="list-disc pl-5">
            <PlayersTable
              data={players.map((p) => ({
                name: p.name,
                typed: p.typed,
                wpm: p.wpm,
                accuracy: p.accuracy,
              }))}
            />
          </ul>
        )}
      </div>
    </main>
  );
}
