import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { setToken } from '../utils/api';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      setToken(data.token);
      loginSuccess(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-app p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm glass rounded-2xl shadow-soft-lg border border-zinc-200 dark:border-zinc-700 p-8"
      >
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Sign in</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Welcome back to Video App</p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2.5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-zinc-400"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2.5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              required
              autoComplete="current-password"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-glow-sm"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Signing in...' : 'Sign in'}
          </motion.button>
        </form>
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400 text-center">
          No account? <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">Register</Link>
        </p>
      </motion.div>
    </div>
  );
}
