import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const { data } = useQuery({
    queryKey: ['cal', cursor.getFullYear(), cursor.getMonth()],
    queryFn: async () =>
      (await api.get('/events/calendar', { params: { year: cursor.getFullYear(), month: cursor.getMonth() } })).data,
  });

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/35">Schedule</p>
          <h1 className="serif mt-1 text-4xl">{format(cursor, 'MMMM yyyy')}</h1>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full bg-white px-3 py-1.5 text-sm dark:bg-white/10" onClick={() => setCursor(addMonths(cursor, -1))}>
            Prev
          </button>
          <button className="rounded-full bg-white px-3 py-1.5 text-sm dark:bg-white/10" onClick={() => setCursor(addMonths(cursor, 1))}>
            Next
          </button>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-wide text-black/35">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const items = (data || []).filter((e) => isSameDay(new Date(e.date), day));
          return (
            <div
              key={day.toISOString()}
              className={`min-h-24 rounded-2xl bg-white p-2 text-left text-xs dark:bg-white/5 ${isSameMonth(day, cursor) ? '' : 'opacity-40'}`}
            >
              <p className="text-[11px] text-black/40">{format(day, 'd')}</p>
              <div className="mt-1 space-y-1">
                {items.map((e) => (
                  <Link key={e._id} to={`/app/events/${e._id}`} className="block truncate rounded-md bg-[#efe6d6] px-1.5 py-0.5">
                    {e.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
