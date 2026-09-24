import LottieBlock from './LottieBlock';

export function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`animate-pulse rounded-xl bg-black/8 dark:bg-white/10 ${className}`} />;
}

export function EmptyState({ title, body, kind = 'empty' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <LottieBlock kind={kind} className="h-36 w-36" />
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-black/50 dark:text-white/50">{body}</p>
    </div>
  );
}

export function StatusPill({ status }) {
  const map = {
    draft: 'bg-stone-200 text-stone-700',
    pending: 'bg-amber-100 text-amber-800',
    changes_requested: 'bg-orange-100 text-orange-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
    in_progress: 'bg-sky-100 text-sky-800',
    completed: 'bg-violet-100 text-violet-800',
    cancelled: 'bg-stone-200 text-stone-600',
    available: 'bg-emerald-100 text-emerald-800',
    maintenance: 'bg-amber-100 text-amber-800',
    closed: 'bg-stone-200 text-stone-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${map[status] || 'bg-stone-100'}`}>
      {String(status || '').replaceAll('_', ' ')}
    </span>
  );
}
