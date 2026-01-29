import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film } from 'lucide-react';
import { videoApi, userApi } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import VideoCardSkeleton from '../components/VideoCardSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Library() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewers, setViewers] = useState([]);
  const [sharingId, setSharingId] = useState(null);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const { onVideoProgress, joinVideo, leaveVideo, connected } = useSocket();
  const isAdmin = user?.role === 'admin';

  const canDeleteVideo = (video) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'editor' && String(video.ownerId) === String(user.id)) return true;
    return false;
  };

  useEffect(() => {
    let cancelled = false;
    videoApi.list()
      .then(({ data }) => { if (!cancelled) setVideos(data); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.error || 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    userApi.listViewers()
      .then(({ data }) => setViewers(data))
      .catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (!connected || videos.length === 0) return;
    const unsubs = videos
      .filter((v) => v.status === 'uploading' || v.status === 'processing')
      .map((v) => {
        joinVideo(v._id);
        return onVideoProgress(v._id, (payload) => {
          setVideos((prev) =>
            prev.map((item) =>
              item._id === v._id
                ? { ...item, status: payload.status, progress: payload.progress ?? item.progress, sensitivity: payload.sensitivity ?? item.sensitivity }
                : item
            )
          );
        });
      });
    return () => {
      unsubs.forEach((off) => off());
      videos.forEach((v) => leaveVideo(v._id));
    };
  }, [connected, videos, joinVideo, leaveVideo, onVideoProgress]);

  const handleShareSelect = (videoId, userId) => {
    videoApi.share(videoId, userId).then(() => setSharingId(null)).catch(() => {});
  };

  const handleDeleteConfirm = () => {
    if (!videoToDelete) return;
    const id = videoToDelete;
    setVideoToDelete(null);
    videoApi.delete(id)
      .then(() => {
        setVideos((prev) => prev.filter((v) => v._id !== id));
        setToast('Video deleted');
        setTimeout(() => setToast(null), 2500);
      })
      .catch((err) => setError(err.response?.data?.error || 'Delete failed'));
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Video library</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-4 text-red-700 dark:text-red-400">
        {error}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {toast && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-soft-lg"
        >
          {toast}
        </motion.p>
      )}

      <ConfirmDialog
        open={!!videoToDelete}
        title="Delete video"
        message="Are you sure you want to delete this video? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setVideoToDelete(null)}
      />

      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Video library</h1>

      {videos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-700 glass shadow-soft p-12 text-center"
        >
          <Film className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-300 font-medium mb-1">No videos yet</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Upload a video or wait for an admin to share one with you.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {videos.map((v, i) => (
              <VideoCard
                key={v._id}
                video={v}
                index={i}
                isAdmin={isAdmin}
                viewers={viewers}
                sharingId={sharingId}
                onShareClick={setSharingId}
                onShareSelect={handleShareSelect}
                canDelete={canDeleteVideo(v)}
                onDeleteClick={setVideoToDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
