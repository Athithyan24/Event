import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Building2, CalendarDays, ClipboardList, Users } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';
import { StatusPill, Skeleton } from '../../components/UiBits';
import LottieBlock from '../../components/LottieBlock';
import { format } from 'date-fns';
import { Stagger } from '../../components/Motion';
import { staggerItem } from '../../components/motionVariants';

export default function Dashboard() {
  const user = useAuth((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: async () => (await api.get('/dashboard/overview')).data,
  });

  const kpis = [
    { label: 'Pending', value: data?.kpis.pending, icon: ClipboardList },
    { label: 'Upcoming', value: data?.kpis.upcoming, icon: CalendarDays },
    { label: 'Venues', value: data?.kpis.venues, icon: Building2 },
    { label: 'People', value: data?.kpis.users, icon: Users },
  ];

  const monthly = (data?.monthly || []).map((m) => ({
    name: `${m._id.m}/${String(m._id.y).slice(2)}`,
    count: m.count,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-black/45 dark:text-white/40">Good day, {user?.name?.split(' ')[0]}</p>
          <h1 className="serif mt-1 text-4xl">Campus at a glance</h1>
        </div>
        <div className="flex items-center gap-3">
          <LottieBlock kind="dashboard" className="h-16 w-16" />
          <Link to="/app/events/new" className="rounded-full bg-[#161412] px-4 py-2 text-sm text-white">
            New request
          </Link>
        </div>
      </div>

      <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <motion.div
            variants={staggerItem}
            key={k.label}
            whileHover={{ y: -4 }}
            className="rounded-3xl bg-white p-5 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.35)] dark:bg-white/5"
          >
            {isLoading ? (
              <Skeleton className="h-12" />
            ) : (
              <>
                <k.icon size={16} className="text-black/35" />
                <p className="serif mt-4 text-4xl">{k.value ?? 0}</p>
                <p className="mt-1 text-sm text-black/45">{k.label}</p>
              </>
            )}
          </motion.div>
        ))}
      </Stagger>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl bg-white p-5 dark:bg-white/5">
          <p className="text-sm font-medium">Monthly programmes</p>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7b3fe4" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7b3fe4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#7b3fe4" fill="url(#g)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5 dark:bg-white/5">
          <p className="text-sm font-medium">Department activity</p>
          <ul className="mt-4 space-y-3">
            {(data?.deptActivity || []).slice(0, 6).map((d) => (
              <li key={d._id?._id || d._id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: d._id?.color || '#111' }} />
                  {d._id?.name || '—'}
                </span>
                <span className="text-black/40">{d.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Coming up</p>
            <Link to="/app/calendar" className="text-xs text-black/40">
              Calendar
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(data?.upcomingEvents || []).map((e) => (
              <Link key={e._id} to={`/app/events/${e._id}`} className="flex items-center justify-between rounded-2xl bg-[#f6f1ea] px-4 py-3 dark:bg-white/5">
                <div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-black/40">
                    {format(new Date(e.date), 'dd MMM')} · {e.startTime} · {e.venue?.name || 'Venue TBA'}
                  </p>
                </div>
                <StatusPill status={e.status} />
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5 dark:bg-white/5">
          <p className="text-sm font-medium">Most used venues</p>
          <ul className="mt-4 space-y-3">
            {(data?.venueUsage || []).map((v) => (
              <li key={v._id?._id || v._id} className="flex justify-between text-sm">
                <span>{v._id?.name || 'Unassigned'}</span>
                <span className="text-black/40">{v.count} bookings</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
