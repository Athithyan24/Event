import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';

export default function Departments() {
  const user = useAuth((s) => s.user);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['depts'], queryFn: async () => (await api.get('/departments')).data });
  const save = useMutation({
    mutationFn: (body) => api.post('/departments', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['depts'] }),
  });
  if (user?.role !== 'admin') return <Navigate to="/app" replace />;

  return (
    <div>
      <h1 className="serif text-4xl">Departments</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data || []).map((d) => (
          <article key={d._id} className="rounded-3xl bg-white p-5 dark:bg-white/5">
            <span className="inline-block h-2 w-8 rounded-full" style={{ background: d.color }} />
            <h2 className="mt-3 text-lg font-medium">{d.name}</h2>
            <p className="text-xs text-black/40">{d.code} · {d.head}</p>
            <p className="mt-2 text-sm text-black/55">{d.description}</p>
            <p className="mt-3 text-xs">{d.isActive ? 'Active' : 'Deactivated'}</p>
          </article>
        ))}
      </div>
      <form
        className="mt-8 grid gap-3 rounded-3xl bg-white p-5 sm:grid-cols-2 dark:bg-white/5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          save.mutate({
            name: fd.get('name'),
            code: fd.get('code'),
            head: fd.get('head'),
            description: fd.get('description'),
            color: fd.get('color') || '#111111',
          });
          e.target.reset();
        }}
      >
        <p className="serif sm:col-span-2 text-xl">Add department</p>
        <input name="name" required placeholder="Name" className="input" />
        <input name="code" required placeholder="Code" className="input" />
        <input name="head" placeholder="Head" className="input" />
        <input name="color" type="color" className="h-11 w-full rounded-xl" />
        <input name="description" placeholder="Description" className="input sm:col-span-2" />
        <button className="rounded-full bg-[#161412] px-4 py-2 text-sm text-white">Create</button>
      </form>
    </div>
  );
}
