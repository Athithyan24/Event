import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { downloadPdf } from '../../lib/download';
import { StatusPill } from '../../components/UiBits';
import { useAuth } from '../../store/auth';
import { useState } from 'react';

export default function EventDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const user = useAuth((s) => s.user);
  const [note, setNote] = useState('');
  const { data } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => (await api.get(`/events/${id}`)).data,
  });
  const participants = useQuery({ queryKey: ['parts', id], queryFn: async () => (await api.get(`/events/${id}/participants`)).data });
  const feedback = useQuery({ queryKey: ['fb', id], queryFn: async () => (await api.get(`/events/${id}/feedback`)).data });
  const certs = useQuery({ queryKey: ['certs', id], queryFn: async () => (await api.get(`/events/${id}/certificates`)).data });

  const review = useMutation({
    mutationFn: (body) => api.post(`/events/${id}/review`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event', id] }),
  });
  const progress = useMutation({
    mutationFn: (body) => api.post(`/events/${id}/progress`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event', id] }),
  });
  const addP = useMutation({
    mutationFn: (body) => api.post(`/events/${id}/participants`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['parts', id] }),
  });
  const addF = useMutation({
    mutationFn: (body) => api.post(`/events/${id}/feedback`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fb', id] }),
  });
  const issue = useMutation({
    mutationFn: () => api.post(`/events/${id}/certificates`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['certs', id] }),
  });

  const event = data?.event;
  if (!event) return <p className="text-sm text-black/40">Loading programme…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div>
        {event.coverImage && <img src={event.coverImage} alt="" className="mb-5 h-56 w-full rounded-[28px] object-cover" />}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-black/40">{event.type} · {event.department?.name}</p>
            <h1 className="serif mt-1 text-4xl">{event.title}</h1>
            <p className="mt-2 text-sm text-black/50">
              {format(new Date(event.date), 'EEEE d MMMM yyyy')} · {event.startTime}–{event.endTime}
            </p>
          </div>
          <StatusPill status={event.status} />
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-black/65">{event.description}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Info label="Venue" value={event.venue?.name || 'TBA'} />
          <Info label="Audience" value={`${event.expectedAudience} expected${event.actualAudience ? ` / ${event.actualAudience} actual` : ''}`} />
          <Info label="Budget" value={`₹${event.budget?.planned || 0} planned`} />
        </div>
        {event.equipment?.length > 0 && (
          <div className="mt-5 rounded-3xl bg-white p-5 dark:bg-white/5">
            <p className="text-sm font-medium">Allocated equipment</p>
            <ul className="mt-3 space-y-1 text-sm text-black/60">
              {event.equipment.map((row) => (
                <li key={row.item?._id || row._id}>
                  {row.item?.name} × {row.quantity}
                </li>
              ))}
            </ul>
          </div>
        )}

        {user?.role === 'admin' && event.status === 'pending' && (
          <div className="mt-5 rounded-3xl bg-white p-5 dark:bg-white/5">
            <p className="text-sm font-medium">Review</p>
            <textarea className="input mt-3" placeholder="Note to the organiser" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-full bg-emerald-700 px-4 py-2 text-sm text-white" onClick={() => review.mutate({ decision: 'approve', reviewNote: note })}>
                Approve
              </button>
              <button className="rounded-full bg-rose-700 px-4 py-2 text-sm text-white" onClick={() => review.mutate({ decision: 'reject', reviewNote: note })}>
                Reject
              </button>
              <button className="rounded-full bg-amber-700 px-4 py-2 text-sm text-white" onClick={() => review.mutate({ decision: 'changes', reviewNote: note })}>
                Request changes
              </button>
            </div>
          </div>
        )}

        {['approved', 'in_progress'].includes(event.status) && (
          <div className="mt-4 flex gap-2">
            {event.status === 'approved' && (
              <button className="rounded-full bg-[#161412] px-4 py-2 text-sm text-white" onClick={() => progress.mutate({ status: 'in_progress' })}>
                Mark in progress
              </button>
            )}
            {event.status === 'in_progress' && (
              <button className="rounded-full bg-[#161412] px-4 py-2 text-sm text-white" onClick={() => progress.mutate({ status: 'completed', actualAudience: event.expectedAudience })}>
                Complete & close
              </button>
            )}
          </div>
        )}

        <section className="mt-6 rounded-3xl bg-white p-5 dark:bg-white/5">
          <p className="text-sm font-medium">Attendees</p>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              addP.mutate({ name: fd.get('name'), email: fd.get('email'), role: 'attendee' });
              e.target.reset();
            }}
          >
            <input name="name" required placeholder="Name" className="input" />
            <input name="email" placeholder="Email" className="input" />
            <button className="rounded-full bg-[#161412] px-4 text-sm text-white">Add</button>
          </form>
          <ul className="mt-3 space-y-2 text-sm">
            {(participants.data || []).map((p) => (
              <li key={p._id} className="flex justify-between rounded-xl bg-[#f6f1ea] px-3 py-2 dark:bg-white/5">
                <span>{p.name}</span>
                <span className="text-black/40">{p.role}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-5 dark:bg-white/5">
          <p className="text-sm font-medium">Feedback · avg {feedback.data?.average || 0}</p>
          <form
            className="mt-3 grid gap-2 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              addF.mutate({ authorName: fd.get('authorName'), rating: Number(fd.get('rating')), comment: fd.get('comment') });
              e.target.reset();
            }}
          >
            <input name="authorName" required placeholder="Your name" className="input" />
            <input name="rating" type="number" min="1" max="5" defaultValue="5" className="input" />
            <input name="comment" placeholder="Comment" className="input sm:col-span-2" />
            <button className="rounded-full bg-[#161412] px-4 py-2 text-sm text-white">Send</button>
          </form>
          <ul className="mt-3 space-y-2">
            {(feedback.data?.rows || []).map((f) => (
              <li key={f._id} className="text-sm">
                <span className="font-medium">{f.authorName}</span> · {f.rating}/5 — {f.comment}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl bg-white p-5 dark:bg-white/5">
          <p className="text-sm font-medium">Timeline</p>
          <ul className="mt-4 space-y-4">
            {(data.timeline || []).map((t, i) => (
              <motion.li key={t._id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative pl-4">
                <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-[#c4a574]" />
                <p className="text-sm font-medium">{t.action}</p>
                <p className="text-xs text-black/40">{t.detail}</p>
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-white p-5 dark:bg-white/5">
          <p className="text-sm font-medium">Certificates</p>
          <button className="mt-3 rounded-full bg-[#161412] px-4 py-2 text-sm text-white" onClick={() => issue.mutate()}>
            Issue for attendees
          </button>
          <ul className="mt-3 space-y-2 text-sm">
            {(certs.data || []).map((c) => (
              <li key={c._id}>
                <button
                  className="underline"
                  onClick={() => downloadPdf(`/events/${id}/certificates/${c._id}/pdf`, `${c.certificateId}.pdf`)}
                >
                  {c.participantName} · {c.certificateId}
                </button>
              </li>
            ))}
          </ul>
          <button
            className="mt-4 inline-block text-xs text-black/45 underline"
            onClick={() => downloadPdf(`/events/${id}/report.pdf`, `${event.title}_report.pdf`)}
          >
            Download closure report (PDF)
          </button>
        </div>
      </aside>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 dark:bg-white/5">
      <p className="text-[11px] uppercase tracking-wide text-black/35">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
