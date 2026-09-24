import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';

export default function Announcements() {
  const user = useAuth((s) => s.user);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['ann'], queryFn: async () => (await api.get('/dashboard/announcements')).data });
  const save = useMutation({
    mutationFn: (body) => api.post('/dashboard/announcements', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ann'] }),
  });

  return (
    <div>
      <h1 className="serif text-4xl">Bulletin</h1>
      <div className="mt-6 space-y-3">
        {(data || []).map((a) => (
          <article key={a._id} className="rounded-3xl bg-white p-5 dark:bg-white/5">
            <p className="text-xs text-black/35">{format(new Date(a.createdAt), 'd MMM yyyy')} {a.pinned ? '· Pinned' : ''}</p>
            <h2 className="mt-1 text-lg font-medium">{a.title}</h2>
            <p className="mt-2 text-sm text-black/60">{a.body}</p>
          </article>
        ))}
      </div>
      {user?.role === 'admin' && (
        <form
          className="mt-8 space-y-3 rounded-3xl bg-white p-5 dark:bg-white/5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            save.mutate({ title: fd.get('title'), body: fd.get('body'), pinned: true, audience: 'all' });
            e.target.reset();
          }}
        >
          <input name="title" required placeholder="Title" className="input" />
          <textarea name="body" required placeholder="Message" className="input min-h-24" />
          <button className="rounded-full bg-[#161412] px-4 py-2 text-sm text-white">Publish</button>
        </form>
      )}
    </div>
  );
}
