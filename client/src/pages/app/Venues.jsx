import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../store/auth';
import api from '../../lib/api';
import { StatusPill } from '../../components/UiBits';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Venues() {
  const user = useAuth((s) => s.user);
  const qc = useQueryClient();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const { data } = useQuery({ queryKey: ['venues'], queryFn: async () => (await api.get('/venues')).data });
  const matrix = useQuery({ queryKey: ['vmatrix', date], queryFn: async () => (await api.get('/venues/matrix', { params: { date } })).data });
  const save = useMutation({
    mutationFn: (body) => api.post('/venues', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venues'] }),
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/35">Spaces</p>
          <h1 className="serif mt-1 text-4xl">Venues</h1>
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input max-w-44" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data || []).map((v) => (
          <motion.article key={v._id} whileHover={{ y: -6 }} className="overflow-hidden rounded-3xl bg-white dark:bg-white/5">
            <img src={v.image} alt="" className="h-36 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-medium">{v.name}</h2>
                  <p className="text-xs text-black/40">{v.building} · {v.location}</p>
                </div>
                <StatusPill status={v.status} />
              </div>
              <p className="mt-3 text-sm text-black/50">{v.capacity} seats</p>
              <p className="mt-1 text-xs text-black/35">{(v.facilities || []).join(' · ')}</p>
            </div>
          </motion.article>
        ))}
      </div>

      <h2 className="serif mt-10 text-2xl">Availability matrix</h2>
      <div className="mt-4 overflow-auto rounded-3xl bg-white p-4 dark:bg-white/5">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr>
              <th className="pb-3 font-medium">Hall</th>
              {(matrix.data?.slots || []).map((s) => (
                <th key={s} className="pb-3 font-medium text-black/45">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(matrix.data?.matrix || []).map((row) => (
              <tr key={row.venue._id} className="border-t border-black/5">
                <td className="py-3">{row.venue.name}</td>
                {row.cells.map((c) => (
                  <td key={c.slot} className="py-3">
                    {c.event ? (
                      <span className="rounded-lg bg-[#efe6d6] px-2 py-1 text-[11px]">{c.event.title}</span>
                    ) : (
                      <span className="text-black/20">·</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {user?.role === 'admin' && (
        <form
          className="mt-8 grid gap-3 rounded-3xl bg-white p-5 sm:grid-cols-2 dark:bg-white/5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            save.mutate({
              name: fd.get('name'),
              location: fd.get('location'),
              building: fd.get('building'),
              capacity: Number(fd.get('capacity')),
              facilities: String(fd.get('facilities') || '').split(',').map((s) => s.trim()).filter(Boolean),
              image: fd.get('image'),
              status: 'available',
            });
            e.target.reset();
          }}
        >
          <p className="serif sm:col-span-2 text-xl">Add venue</p>
          <input name="name" required placeholder="Name" className="input" />
          <input name="building" required placeholder="Building" className="input" />
          <input name="location" required placeholder="Location" className="input" />
          <input name="capacity" type="number" required placeholder="Capacity" className="input" />
          <input name="facilities" placeholder="Facilities, comma separated" className="input sm:col-span-2" />
          <input name="image" placeholder="Image URL" className="input sm:col-span-2" />
          <button className="rounded-full bg-[#161412] px-4 py-2 text-sm text-white">Save hall</button>
        </form>
      )}
    </div>
  );
}
