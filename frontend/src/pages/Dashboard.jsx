import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Library } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const canUpload = user?.role === 'editor' || user?.role === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Dashboard</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Welcome back, {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Link
            to="/library"
            className="flex items-center gap-4 p-5 rounded-2xl glass border border-zinc-200 dark:border-zinc-700 shadow-soft hover:shadow-soft-lg transition-all duration-200"
          >
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              <Library className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">View library</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Browse your videos</p>
            </div>
          </Link>
        </motion.div>

        {canUpload && (
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Link
              to="/upload"
              className="flex items-center gap-4 p-5 rounded-2xl glass border border-zinc-200 dark:border-zinc-700 shadow-soft hover:shadow-soft-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all duration-200"
            >
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Upload video</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Add a new video</p>
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
