import { Outlet, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, LayoutDashboard, Library, Upload, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canUpload = user?.role === 'editor' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-app transition-colors">
      <nav className="glass sticky top-0 z-10 px-4 py-3 flex items-center justify-between rounded-none border-b border-zinc-200 dark:border-zinc-700 shadow-soft">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <Film className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Video App
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/library"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
            >
              <Library className="w-4 h-4" />
              Library
            </Link>
            {canUpload && (
              <Link
                to="/upload"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                Upload
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <User className="w-4 h-4" />
            {user?.email}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 capitalize">
            {user?.role}
          </span>
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
