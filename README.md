# Video Upload, Processing, and Streaming

## Prerequisites

- Node.js (LTS)
- MongoDB
- FFmpeg on PATH

## Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET
npm run dev
```

Runs on http://localhost:3000. Creates `uploads/` and `processed/` for files.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
# For real-time progress set VITE_WS_URL=http://localhost:3000
npm run dev
```

Runs on http://localhost:5173. Proxies `/api` to backend when using default VITE_API_URL.

## Quick test

1. Start MongoDB.
2. Start backend, then frontend.
3. Register (choose role: viewer / editor / admin).
4. As editor or admin: Upload → pick file → see processing progress; when ready, play from Library.
