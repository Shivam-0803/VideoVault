import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, FileVideo, X } from 'lucide-react';
import { videoApi } from '../services/api';
import { cn } from '../lib/utils';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setError('');
      if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) {
      setError('Please drop a video file (mp4, webm, mov, avi)');
      return;
    }
    setFile(f);
    setError('');
    if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Select or drop a video file');
      return;
    }
    setError('');
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title.trim() || file.name);
      const { data } = await videoApi.upload(formData, (ev) => {
        if (ev.total) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
      });
      navigate(`/video/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-xl space-y-6"
    >
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Upload video</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2"
          >
            <X className="w-4 h-4 shrink-0" />
            {error}
          </motion.p>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2.5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-zinc-400"
            placeholder="Video title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">File</label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors',
              dragOver ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30' : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30',
              file && 'border-emerald-300 dark:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3 text-emerald-700 dark:text-emerald-400">
                <FileVideo className="w-10 h-10" />
                <span className="font-medium truncate max-w-[200px]">{file.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <UploadIcon className="w-10 h-10" />
                <span className="font-medium">Drop a video here or click to browse</span>
                <span className="text-sm">mp4, webm, mov, avi — max 500MB</span>
              </div>
            )}
          </div>
        </div>

        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Uploading... {uploadProgress}%</p>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={uploading || !file}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-glow-sm"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </motion.button>
      </form>
    </motion.div>
  );
}
