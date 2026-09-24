import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';

export default function Users() {
  const user = useAuth((s) => s.user);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['users'], queryFn: async () => (await api.get('/users')).data });
  const depts = useQuery({ queryKey: ['depts'], queryFn: async () => (await api.get('/departments')).data });
  const save = useMutation({
    mutationFn: (body) => api.post('/users', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
  if (user?.role !== 'admin') return <Navigate to="/app" replace />;

  return (
    <div>
      <h1 className="serif text-4xl">People</h1>
      <div className="mt-6 overflow-auto rounded-3xl bg-white dark:bg-white/5">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-black/40">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium">Email</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((u) => (
              <tr key={u.id} className="border-t border-black/5">
                <td className="px-5 py-3">{u.name}</td>
                <td className="px-5 py-3 capitalize">{u.role}</td>
                <td className="px-5 py-3">{u.department?.name || '—'}</td>
                <td className="px-5 py-3 text-black/50">{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form
        className="mt-8 grid gap-3 rounded-3xl bg-white p-5 sm:grid-cols-2 dark:bg-white/5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          save.mutate({
            name: fd.get('name'),
            username: fd.get('username'),
            email: fd.get('email'),
            password: fd.get('password'),
            role: fd.get('role'),
            department: fd.get('department') || null,
          });
          e.target.reset();
        }}
      >
        <p className="serif sm:col-span-2 text-xl">Create account</p>
        <input name="name" required placeholder="Full name" className="input" />
        <input name="username" required placeholder="Username" className="input" />
        <input name="email" type="email" required placeholder="Email" className="input" />
        <input name="password" required placeholder="Password" className="input" />
        <select name="role" className="input">
          <option value="department">Department user</option>
          <option value="coordinator">Coordinator</option>
          <option value="admin">Admin</option>
        </select>
        <select name="department" className="input">
          <option value="">No department</option>
          {(depts.data || []).map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <button className="rounded-full bg-[#161412] px-4 py-2 text-sm text-white">Create user</button>
      </form>
    </div>
  );
}
