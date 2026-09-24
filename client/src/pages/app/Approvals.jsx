import { useQuery } from '@tanstack/react-query';
import { Link, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';
import { StatusPill, EmptyState } from '../../components/UiBits';
import LottieBlock from '../../components/LottieBlock';

export default function Approvals() {
  const user = useAuth((s) => s.user);
  const { data } = useQuery({
    queryKey: ['pending'],
    queryFn: async () => (await api.get('/events', { params: { status: 'pending' } })).data,
  });
  if (user?.role !== 'admin') return <Navigate to="/app" replace />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/35">Queue</p>
          <h1 className="serif mt-1 text-4xl">Approvals</h1>
        </div>
        <LottieBlock kind="workflow" className="h-20 w-20" />
      </div>
      {!data?.length && <EmptyState title="Nothing waiting" body="New department requests will land here." kind="workflow" />}
      <div className="mt-6 space-y-3">
        {(data || []).map((e) => (
          <Link key={e._id} to={`/app/events/${e._id}`} className="flex items-center justify-between rounded-3xl bg-white px-5 py-4 dark:bg-white/5">
            <div>
              <p className="font-medium">{e.title}</p>
              <p className="text-xs text-black/40">
                {e.department?.name} · {format(new Date(e.date), 'd MMM')} · {e.venue?.name || 'No hall'}
              </p>
            </div>
            <StatusPill status={e.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
