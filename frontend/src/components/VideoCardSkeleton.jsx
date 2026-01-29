import { motion } from 'framer-motion';

export default function VideoCardSkeleton() {
  return (
    <div className="glass rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-soft overflow-hidden animate-pulse">
      <div className="aspect-video bg-zinc-200 dark:bg-zinc-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded w-16" />
          <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded w-12 ml-auto" />
        </div>
      </div>
    </div>
  );
}
