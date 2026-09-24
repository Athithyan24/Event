import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../../lib/api';
const TYPES = ['Seminar', 'Workshop', 'Conference', 'Guest Lecture', 'Hackathon', 'Training Program', 'Meeting', 'Cultural Program', 'Placement Drive'];

export default function EventCreate() {
  const [step, setStep] = useState(0);
  const [conflict, setConflict] = useState(null);
  const navigate = useNavigate();
  const { control, register, handleSubmit, setValue } = useForm({
    defaultValues: { expectedAudience: 50, startTime: '10:00', endTime: '12:00', equipment: [] },
  });
  const venues = useQuery({ queryKey: ['venues'], queryFn: async () => (await api.get('/venues')).data });
  const equipment = useQuery({ queryKey: ['equipment'], queryFn: async () => (await api.get('/equipment')).data });

  const create = useMutation({
    mutationFn: (payload) => api.post('/events', payload),
    onSuccess: ({ data }) => navigate(`/app/events/${data._id}`),
    onError: (err) => setConflict(err.response?.data),
  });

  const selectedEq = useWatch({ control, name: 'equipmentQty' }) || {};

  const submit = (form) => {
    const equipmentRows = Object.entries(selectedEq)
      .filter(([, q]) => Number(q) > 0)
      .map(([item, quantity]) => ({ item, quantity: Number(quantity) }));
    create.mutate({
      title: form.title,
      type: form.type,
      description: form.description,
      expectedAudience: Number(form.expectedAudience),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      venue: form.venue,
      equipment: equipmentRows,
      budget: { planned: Number(form.budget || 0) },
    });
  };

  const steps = ['Story', 'Schedule', 'Resources'];

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs uppercase tracking-[0.2em] text-black/35">New request</p>
      <h1 className="serif mt-1 text-4xl">Plan a programme</h1>
      <div className="mt-6 flex gap-2">
        {steps.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className={`rounded-full px-3 py-1 text-xs ${step === i ? 'bg-[#161412] text-white' : 'bg-white'}`}>
            {s}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit(submit)} className="mt-6 rounded-3xl bg-white p-6 dark:bg-white/5">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <Field label="Title">
                <input className="input" {...register('title', { required: true })} />
              </Field>
              <Field label="Type">
                <select className="input" {...register('type', { required: true })}>
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Description">
                <textarea className="input min-h-28" {...register('description')} />
              </Field>
              <Field label="Expected audience">
                <input type="number" className="input" {...register('expectedAudience')} />
              </Field>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <Field label="Date">
                <input type="date" className="input" {...register('date', { required: true })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start">
                  <input type="time" className="input" {...register('startTime')} />
                </Field>
                <Field label="End">
                  <input type="time" className="input" {...register('endTime')} />
                </Field>
              </div>
              <Field label="Venue">
                <select className="input" {...register('venue', { required: true })}>
                  <option value="">Select a hall</option>
                  {(venues.data || []).map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} · {v.capacity} seats · {v.status}
                    </option>
                  ))}
                </select>
              </Field>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <Field label="Planned budget (₹)">
                <input type="number" className="input" {...register('budget')} />
              </Field>
              <p className="text-sm font-medium">Equipment</p>
              {(equipment.data || []).map((item) => (
                <div key={item._id} className="flex items-center justify-between rounded-2xl bg-[#f6f1ea] px-3 py-2 text-sm dark:bg-white/5">
                  <span>
                    {item.name} <span className="text-black/35">({item.totalQuantity} in stock)</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    className="w-16 rounded-lg border-0 bg-white px-2 py-1 text-right"
                    onChange={(e) => setValue(`equipmentQty.${item._id}`, e.target.value)}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-6 flex justify-between">
          <button type="button" className="text-sm text-black/45" onClick={() => setStep(Math.max(0, step - 1))}>
            Back
          </button>
          {step < 2 ? (
            <button type="button" className="rounded-full bg-[#161412] px-4 py-2 text-sm text-white" onClick={() => setStep(step + 1)}>
              Continue
            </button>
          ) : (
            <button className="rounded-full bg-[#7b3fe4] px-4 py-2 text-sm text-white" disabled={create.isPending}>
              {create.isPending ? 'Checking…' : 'Submit request'}
            </button>
          )}
        </div>
        {conflict?.message && (
          <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm">
            <p className="font-medium text-rose-800">{conflict.message}</p>
            {conflict.issues?.map((iss, i) => (
              <p key={i} className="mt-1 text-rose-700">
                {iss.message}
                {iss.details?.map((d) => ` · remaining ${d.remaining}`).join('')}
              </p>
            ))}
            {conflict.alternatives?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs uppercase tracking-wide text-rose-700">Suggested halls</p>
                {conflict.alternatives.map((v) => (
                  <button
                    type="button"
                    key={v._id}
                    className="mt-1 block text-left text-rose-900 underline"
                    onClick={() => {
                      setValue('venue', v._id);
                      setConflict(null);
                      setStep(1);
                    }}
                  >
                    {v.name} · capacity {v.capacity}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="text-xs text-black/45">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
