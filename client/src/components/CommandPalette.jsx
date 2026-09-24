import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useUi } from '../store/ui';
import api from '../lib/api';

export default function CommandPalette() {
  const { commandOpen, setCommand } = useUi();
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommand(!commandOpen);
      }
      if (e.key === 'Escape') setCommand(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commandOpen, setCommand]);

  useEffect(() => {
    if (!commandOpen) return;
    const t = setTimeout(async () => {
      const { data } = await api.get('/dashboard/search', { params: { q } });
      setRes(data);
    }, 180);
    return () => clearTimeout(t);
  }, [q, commandOpen]);

  const go = (path) => {
    setCommand(false);
    navigate(path);
  };

  return (
    <AnimatePresence>
      {commandOpen && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-start bg-black/30 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCommand(false)}
        >
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1c1a18]"
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events, venues, people…"
              className="w-full border-b border-black/8 bg-transparent px-4 py-4 text-sm outline-none"
            />
            <div className="max-h-80 overflow-auto p-2 text-sm">
              {!q && (
                <div className="space-y-1 p-2 text-black/50">
                  <button className="block w-full rounded-lg px-3 py-2 text-left hover:bg-black/5" onClick={() => go('/app/events/new')}>
                    New event request
                  </button>
                  <button className="block w-full rounded-lg px-3 py-2 text-left hover:bg-black/5" onClick={() => go('/app/calendar')}>
                    Open calendar
                  </button>
                </div>
              )}
              {res?.events?.map((e) => (
                <button key={e._id} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-black/5" onClick={() => go(`/app/events/${e._id}`)}>
                  {e.title}
                  <span className="ml-2 text-xs text-black/40">{e.type}</span>
                </button>
              ))}
              {res?.venues?.map((v) => (
                <button key={v._id} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-black/5" onClick={() => go('/app/venues')}>
                  {v.name} · {v.building}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
