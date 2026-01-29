import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Share2, Film, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiUrl } from '../utils/api.js';

const statusStyles = {
  uploading: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700 shadow-glow-sm',
  processing: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700 shadow-glow-sm',
  ready: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 shadow-glow-sm',
  failed: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700',
};

function StatusBadge({ status, sensitivity }) {
  const style = statusStyles[status] ?? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600';
  return (
    <motion.span
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      className={cn('text-xs font-medium px-2 py-0.5 rounded-md border', style)}
    >
      {status}
      {sensitivity && ` · ${sensitivity}`}
    </motion.span>
  );
}

export default function VideoCard({ video, isAdmin, viewers, sharingId, onShareClick, onShareSelect, canDelete, onDeleteClick, index }) {
  const isProcessing = video.status === 'uploading' || video.status === 'processing';
  const thumbnailUrl = video.thumbnailPath
    ? apiUrl(video.thumbnailPath.startsWith('/') ? video.thumbnailPath : '/thumbnails/' + video.thumbnailPath)
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      whileHover={{ y: -2 }}
      className="group glass rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-soft overflow-hidden hover:shadow-soft-lg transition-shadow duration-200"
    >
      <Link to={`/video/${video._id}`} className="block">
        <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden rounded-t-xl">
          {thumbnailUrl ? (
            <motion.img
              src={thumbnailUrl}
              alt=""
              className="w-full h-full object-cover rounded-t-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            />
          ) : (
            <Film className="w-12 h-12 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors" />
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link to={`/video/${video._id}`} className="flex-1 min-w-0">
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {video.title}
            </h3>
          </Link>
          <StatusBadge status={video.status} sensitivity={video.sensitivity} />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          {isProcessing ? `${video.progress ?? 0}%` : new Date(video.createdAt).toLocaleString()}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            sharingId === video._id ? (
              <select
                className="text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg px-2 py-1.5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const uid = e.target.value;
                  if (uid) onShareSelect(video._id, uid);
                }}
                onBlur={() => onShareClick(null)}
                autoFocus
              >
                <option value="">Select viewer</option>
                {viewers.map((u) => (
                  <option key={u._id} value={u._id}>{u.email}</option>
                ))}
              </select>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); onShareClick(video._id); }}
                className="inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            )
          )}
          {canDelete && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onDeleteClick?.(video._id); }}
              className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
          <Link
            to={`/video/${video._id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 ml-auto"
          >
            <Play className="w-3.5 h-3.5" />
            {video.status === 'ready' ? 'Play' : 'View'}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
