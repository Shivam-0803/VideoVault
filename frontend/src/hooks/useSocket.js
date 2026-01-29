import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

// Env from Vite: local dev uses .env (localhost), production uses .env.production (Render)
const wsUrl = import.meta.env.VITE_WS_URL || '';

function canUseSocket(role) {
  return role === 'editor' || role === 'admin';
}

/**
 * useSocket – single Socket.IO client for video progress.
 * File exists here so Vite can resolve "../hooks/useSocket" from Library/Player.
 * Named export to match existing imports.
 */
export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!wsUrl || !getToken() || !canUseSocket(user?.role)) return;

    const socket = io(wsUrl, {
      auth: { token: getToken() },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 8000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('Socket connected');
    });
    socket.on('disconnect', () => setConnected(false));
    // Swallow connect_error so UI never crashes when backend is offline or cold start
    socket.on('connect_error', () => {});

    return () => {
      socket.removeAllListeners();
      socket.close();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user?.role]);

  const joinVideo = (videoId) => socketRef.current?.emit('join-video', videoId);
  const leaveVideo = (videoId) => socketRef.current?.emit('leave-video', videoId);

  const onVideoProgress = (videoId, cb) => {
    if (!socketRef.current || !videoId) return () => {};
    const event = `video-progress-${videoId}`;
    socketRef.current.on(event, cb);
    return () => socketRef.current?.off(event, cb);
  };

  return { socket: socketRef.current, connected, joinVideo, leaveVideo, onVideoProgress };
}
