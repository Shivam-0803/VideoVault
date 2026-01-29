import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io = null;

export function initSocket(httpServer, app) {
  const origin = process.env.FRONTEND_URL || 'http://localhost:5173';

  io = new Server(httpServer, {
    cors: {
      origin,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['polling'], // ✅ IMPORTANT (Render free tier fix)
  });

  if (app) app.set('io', io);

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) return next(new Error('Auth required'));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.userId).select('_id role');

      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.role = user.role;

      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-video', (videoId) => {
      socket.join(`video-${videoId}`);
    });

    socket.on('leave-video', (videoId) => {
      socket.leave(`video-${videoId}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
}

export function getIo() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
