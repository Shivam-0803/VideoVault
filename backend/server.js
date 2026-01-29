import 'dotenv/config';
import http from 'http';
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { connectDb } from './config/db.js';
import { initSocket } from './sockets/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const server = http.createServer(app);

connectDb().then(() => {
  initSocket(server, app);

  app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true }));
  app.use(express.json());

  app.use('/auth', authRoutes);
  app.use('/videos', videoRoutes);
  app.use('/users', userRoutes);
  const thumbDir = path.join(process.cwd(), 'thumbnails');
  if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
  app.use('/thumbnails', express.static(thumbDir));

  app.use(errorHandler);

  const port = process.env.PORT ?? 3000;
  server.listen(port, () => console.log(`Server on port ${port}`));
}).catch((err) => {
  console.error('DB connection failed:', err);
  process.exit(1);
});
