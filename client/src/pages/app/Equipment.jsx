import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../store/auth';
import api from '../../lib/api';
import { useState } from 'react';

export default function Equipment() {
  const user = useAuth((s) => s.user);
  const qc = useQueryClient();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const { data } = useQuery({ queryKey: ['equipment'], queryFn: async () => (await api.get('/equipment')).data });
  const matrix = useQuery({ queryKey: ['ematrix', date], queryFn: async () => (await api.get('/equipment/matrix', { params: { date } })).data });
  const save = useMutation({
    mutationFn: (body) => api.post('/equipment', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipment'] }),
  });

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/35">Inventory</p>
          <h1 className="serif mt-1 text-4xl">Equipment</h1>
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input max-w-44" />
      </div>
      <div className="mt-6 overflow-auto rounded-3xl bg-white dark:bg-white/5">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-black/40">
              <th className="px-5 py-3 font-medium">Item</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Reserved today</th>
              <th className="px-5 py-3 font-medium">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {(matrix.data?.matrix || data?.map((item) => ({ item, reserved: 0, remaining: item.totalQuantity })) || []).map((row) => (
              <tr key={row.item._id} className="border-t border-black/5">
                <td className="px-5 py-3">{row.item.name}</td>
                <td className="px-5 py-3">{row.item.totalQuantity}</td>
                <td className="px-5 py-3">{row.reserved ?? 0}</td>
                <td className="px-5 py-3">{row.remaining ?? row.item.totalQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {user?.role === 'admin' && (
        <form
          className="mt-6 grid gap-3 rounded-3xl bg-white p-5 sm:grid-cols-3 dark:bg-white/5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            save.mutate({ name: fd.get('name'), category: fd.get('category'), totalQuantity: Number(fd.get('totalQuantity')) });
            e.target.reset();
          }}
        >
          <input name="name" required placeholder="Name" className="input" />
          <input name="category" placeholder="Category" className="input" />
          <input name="totalQuantity" type="number" required placeholder="Quantity" className="input" />
          <button className="rounded-full bg-[#161412] px-4 py-2 text-sm text-white">Add item</button>
        </form>
      )}
    </div>
  );
}
