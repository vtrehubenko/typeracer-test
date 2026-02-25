🏎️ Typerace (Realtime Writing Competition)

A real-time multiplayer typing competition platform built with Next.js + Socket.IO + TanStack Table + Prisma (ready for persistence).

👉 Live Demo:
https://typeracer-test.vercel.app/

⚠️ The Socket server is deployed on Render (free tier).
Due to free instance sleep policy, the first connection may take up to 30–60 seconds to wake up.

✨ Features

Real-time multiplayer typing (Socket.IO)

Fixed-time rounds with automatic sentence rotation

Live progress per player

Words Per Minute (WPM) calculation

Accuracy calculation (percentage, rounded)

Sorted & paginated results table (TanStack Table)

URL-synced sorting and pagination

Client-side sentence highlighting (correct/incorrect chars)

Unit tests for typing metrics (Vitest)

Production-ready environment configuration

🏗️ Architecture
Frontend

Next.js (App Router)

TanStack Table (sorting + pagination)

TailwindCSS

Socket.IO client

Deployed on Vercel

Backend (Realtime)

Node.js + Socket.IO

In-memory game state (room-based)

Per-room interval loop for rounds

Server-side WPM & Accuracy calculation

Deployed on Render

🔌 Deployment Architecture

Vercel does not support long-lived WebSocket servers.
Therefore the architecture is split:

[Vercel - Next.js Frontend]
          │
          ▼
[Render - Socket.IO Server]

Environment variables:

Vercel
NEXT_PUBLIC_SOCKET_URL=https://your-render-service.onrender.com
Render
CLIENT_ORIGIN=https://typeracer-test.vercel.app
PORT (provided automatically by Render)
🧮 Metrics Calculation
Accuracy
correctChars / totalTypedChars

Returns 0% if no characters typed

Displayed as rounded percentage

WPM
correctWords / elapsedMinutes

Only fully correct words count

Stops counting at first incorrect word

Rounded in UI

Unit-tested using Vitest.
🧠 Design Decisions

Server-authoritative metrics (cannot cheat from client)

Per-room interval instead of recursive timeouts (stable round timer)

URL-synced table state (refresh-safe sorting)

Client-side text highlighting for UX clarity

Unit tests for core logic

Environment-based config for production readiness

🚀 Future Improvements

Persistent player statistics (Postgres via Prisma)

Leaderboard history

E2E tests (Playwright)

Rate limiting & room scaling

Redis adapter for horizontal scaling
