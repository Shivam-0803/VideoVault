import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io = null;

export function initSocket(httpServer, allowedOrigins) {
  const origins = Array.isArray(allowedOrigins) && allowedOrigins.length
    ? allowedOrigins
    : ['http://localhost:5173', 'https://video-vault-hazel.vercel.app'];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket'],
  });

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
    try {
      console.log('Socket connected:', socket.id);
    } catch (err) {
      console.error('Socket connection log:', err.message);
    }

    socket.on('join-video', (videoId) => {
      try {
        socket.join(`video-${videoId}`);
      } catch (err) {
        console.error('join-video:', err.message);
      }
    });

    socket.on('leave-video', (videoId) => {
      try {
        socket.leave(`video-${videoId}`);
      } catch (err) {
        console.error('leave-video:', err.message);
      }
    });

    socket.on('disconnect', () => {
      try {
        console.log('Socket disconnected:', socket.id);
      } catch (err) {
        console.error('Socket disconnect log:', err.message);
      }
    });
  });

  return io;
}

export function getIo() {
  return io ?? null;
}
