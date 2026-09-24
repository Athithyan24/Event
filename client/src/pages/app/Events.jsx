import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import api from '../../lib/api';
import { StatusPill, EmptyState, Skeleton } from '../../components/UiBits';

export default function Events() {
  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => (await api.get('/events')).data,
  });

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/35">Programmes</p>
          <h1 className="serif mt-1 text-4xl">Event board</h1>
        </div>
        <Link to="/app/events/new" className="rounded-full bg-[#161412] px-4 py-2 text-sm text-white">
          Request event
        </Link>
      </div>
      {isLoading && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      )}
      {!isLoading && !data?.length && <EmptyState title="No programmes yet" body="Start with a venue, a time, and a story." kind="empty" />}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {(data || []).map((e, i) => (
          <motion.div key={e._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -6, scale: 1.01 }}>
            <Link to={`/app/events/${e._id}`} className="block overflow-hidden rounded-3xl bg-white shadow-[0_16px_50px_-32px_rgba(0,0,0,0.4)] dark:bg-white/5">
              {e.coverImage && <img src={e.coverImage} alt="" className="h-36 w-full object-cover" />}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-black/40">{e.type}</p>
                    <h2 className="mt-1 text-lg font-medium">{e.title}</h2>
                  </div>
                  <StatusPill status={e.status} />
                </div>
                <p className="mt-3 text-sm text-black/50">
                  {format(new Date(e.date), 'EEE d MMM')} · {e.startTime}–{e.endTime}
                </p>
                <p className="mt-1 text-sm text-black/40">
                  {e.venue?.name || 'Venue pending'} · {e.department?.name}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
