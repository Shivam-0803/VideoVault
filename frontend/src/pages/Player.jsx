import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { videoApi } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { cn } from '../lib/utils';

export default function Player() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { onVideoProgress, joinVideo, leaveVideo, connected } = useSocket();
  const videoRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    videoApi.list()
      .then(({ data }) => {
        const v = data.find((x) => x._id === id);
        if (!cancelled) setVideo(v ?? null);
      })
      .catch(() => { if (!cancelled) setError('Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!id || !connected) return;
    joinVideo(id);
    const unsub = onVideoProgress(id, (payload) => {
      setVideo((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: payload.status,
          progress: payload.progress ?? prev.progress,
          sensitivity: payload.sensitivity ?? prev.sensitivity,
        };
      });
    });
    return () => {
      unsub();
      leaveVideo(id);
    };
  }, [id, connected, joinVideo, leaveVideo, onVideoProgress]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
      >
        <Loader2 className="w-10 h-10 text-zinc-400 dark:text-zinc-500 animate-spin" />
        <p className="text-zinc-500 dark:text-zinc-400">Loading video...</p>
      </motion.div>
    );
  }

  if (error || !video) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-6 text-red-700 dark:text-red-400">
        {error || 'Video not found'}
      </motion.div>
    );
  }

  const streamUrl = videoApi.streamUrl(id);
  const canPlay = video.status === 'ready';

  const statusStyles = {
    ready: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
    failed: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700',
    processing: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700',
    uploading: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto"
    >
      <Link
        to="/library"
        className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to library
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{video.title}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md border', statusStyles[video.status] ?? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600')}>
            {video.status}
          </span>
          {video.sensitivity && (
            <span className="text-xs px-2 py-0.5 rounded-md border bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600">
              {video.sensitivity}
            </span>
          )}
        </div>
      </div>

      {canPlay ? (
        <div className="rounded-2xl overflow-hidden bg-black shadow-soft-lg ring-1 ring-zinc-800 dark:ring-zinc-700">
          <video
            ref={videoRef}
            controls
            className="w-full"
            src={streamUrl}
            crossOrigin="use-credentials"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-12 text-center glass">
          {video.status === 'failed' ? (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-12 h-12 text-red-400 dark:text-red-500" />
              <p className="text-zinc-700 dark:text-zinc-300 font-medium">Processing failed</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">This video could not be processed. Try uploading again.</p>
            </div>
          ) : (
            <div className="max-w-sm mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-6 h-6 text-amber-500 dark:text-amber-400 animate-spin shrink-0" />
                <p className="text-zinc-700 dark:text-zinc-300 font-medium">Processing video...</p>
              </div>
              <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500 dark:bg-amber-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${video.progress ?? 0}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">{video.progress ?? 0}%</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
