import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const wsUrl = import.meta.env.VITE_WS_URL;

function canUseSocket(role) {
  return role === 'editor' || role === 'admin';
}

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!wsUrl || !getToken() || !canUseSocket(user?.role)) return;

    const socket = io(wsUrl, {
      auth: { token: getToken() },
      withCredentials: true,

      // ✅ MUST MATCH BACKEND (Render-safe)
      transports: ['polling'],

      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 8000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('✅ Socket connected');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket error:', err.message);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user?.role]);

  const joinVideo = (videoId) => {
    socketRef.current?.emit('join-video', videoId);
  };

  const leaveVideo = (videoId) => {
    socketRef.current?.emit('leave-video', videoId);
  };

  const onVideoProgress = (videoId, cb) => {
    if (!socketRef.current || !videoId) return () => {};
    const event = `video-progress-${videoId}`;
    socketRef.current.on(event, cb);
    return () => socketRef.current.off(event, cb);
  };

  return {
    socket: socketRef.current,
    connected,
    joinVideo,
    leaveVideo,
    onVideoProgress,
  };
}
