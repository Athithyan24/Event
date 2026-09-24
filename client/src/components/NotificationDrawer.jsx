import { AnimatePresence, motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useUi } from '../store/ui';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDrawer() {
  const { notesOpen, setNotes } = useUi();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/dashboard/notifications')).data,
    enabled: notesOpen,
  });
  const readAll = useMutation({
    mutationFn: () => api.post('/dashboard/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <AnimatePresence>
      {notesOpen && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNotes(false)} />
          <motion.aside
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[360px] flex-col bg-white shadow-2xl dark:bg-[#1c1a18]"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <p className="font-medium">Inbox</p>
              <button className="text-xs text-black/45" onClick={() => readAll.mutate()}>
                Mark all read
              </button>
            </div>
            <div className="flex-1 space-y-2 overflow-auto px-3 pb-6">
              {(data || []).map((n) => (
                <div key={n._id} className={`rounded-2xl p-3 ${n.read ? 'bg-black/3' : 'bg-[#f6f1ea]'}`}>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-1 text-xs text-black/50">{n.message}</p>
                  <p className="mt-2 text-[10px] text-black/35">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
