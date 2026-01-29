import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const socketUrl = import.meta.env.VITE_WS_URL || '';

function canUseSocket(role) {
  return role === 'editor' || role === 'admin';
}

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socketUrl) return;
    const token = getToken();
    if (!token || !canUseSocket(user?.role)) return;
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    return () => {
      socket.close();
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
    return () => socketRef.current?.off(event, cb);
  };

  return { socket: socketRef.current, connected, joinVideo, leaveVideo, onVideoProgress };
}
