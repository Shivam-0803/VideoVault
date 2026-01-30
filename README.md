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

## Deployment & Video Processing Note

The backend uses FFmpeg for transcoding and Socket.IO for real-time progress. On **Render free tier** (512MB RAM), FFmpeg exceeds memory limits and causes crashes, so **video processing is disabled in production** for that environment. This is an intentional tradeoff, not a bug.

- **What still works in production:** Upload flow, UI, real-time socket logic, and playback of any already-processed or direct-served assets. Users can upload and see status; processing simply does not run on the free-tier instance.
- **Full processing** (transcode + thumbnails + progress) works when running **locally** or on **Render Starter** (or any host with ~1GB+ RAM). Use the same codebase; only the deployment constraints differ.

**Interview explanation:** "We disabled FFmpeg on the free-tier backend to stay within 512MB; the rest of the stack is unchanged and processing runs on local or paid hosting."

On Render free tier (512MB RAM), FFmpeg-based video processing may be unstable or disabled due to memory limits. This is a hosting constraint, not an architectural limitation. The system works correctly on higher-memory instances or locally.
