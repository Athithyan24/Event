import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import api from '../../lib/api';

export default function Reports() {
  const overview = useQuery({ queryKey: ['overview'], queryFn: async () => (await api.get('/dashboard/overview')).data });
  const feedback = useQuery({ queryKey: ['fba'], queryFn: async () => (await api.get('/dashboard/feedback')).data });
  const venue = (overview.data?.venueUsage || []).map((v) => ({ name: v._id?.name || '—', count: v.count }));
  const eq = (overview.data?.equipmentUsage || []).map((v) => ({ name: v._id?.name || '—', qty: v.qty }));

  return (
    <div>
      <h1 className="serif text-4xl">Resource reports</h1>
      <p className="mt-2 max-w-xl text-sm text-black/50">Utilisation across halls, kits and departments — the numbers a viva panel actually asks for.</p>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 dark:bg-white/5">
          <p className="text-sm font-medium">Venue usage</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={venue}>
                <XAxis dataKey="name" hide />
                <Tooltip />
                <Bar dataKey="count" fill="#161412" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5 dark:bg-white/5">
          <p className="text-sm font-medium">Equipment allocation</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eq}>
                <XAxis dataKey="name" hide />
                <Tooltip />
                <Bar dataKey="qty" fill="#7b3fe4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-3xl bg-white p-5 dark:bg-white/5">
        <p className="text-sm font-medium">Feedback by programme</p>
        <ul className="mt-3 space-y-2 text-sm">
          {(feedback.data || []).map((f) => (
            <li key={f._id?._id || f._id} className="flex justify-between">
              <span>{f._id?.title || 'Event'}</span>
              <span className="text-black/40">{Number(f.avg).toFixed(2)} · {f.count} reviews</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
