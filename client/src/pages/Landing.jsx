import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowUpRight } from 'lucide-react';
import { FadeUp, HoverLift } from '../components/Motion';

const photos = [
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1586765429758-ec88f3425101?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1741681001349-3e6782963522?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=400&q=80',
];

const chips = ['Our story', 'Studies', 'Insights', 'Our approach', 'Our partners', 'Our services'];

export default function Landing() {
  return (
    <div className="bg-[#faf8f5] text-[#161412]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-sm">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[#171411] text-[11px] font-semibold text-white">A</span>
          <span className="font-medium tracking-tight">Aura</span>
        </div>
        <div className="hidden text-center md:block">
          <p className="serif text-lg leading-none">Aura</p>
          <p className="mt-1 max-w-[220px] text-[10px] leading-snug text-black/45">
            Campus events, venues and equipment — planned with the calm of a studio, not a spreadsheet.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button className="grid h-9 w-9 place-items-center rounded-full border border-black/10" aria-label="Search">
            <Search size={15} />
          </button>
          <Link to="/login" className="rounded-full bg-[#171411] px-4 py-2 text-xs text-white">
            Sign in
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-6 pt-8 text-center">
        <FadeUp>
          <h1 className="serif text-[56px] leading-[0.9] tracking-tight sm:text-[88px] md:text-[108px]">
            Welcome to
            <br />
            Aura
          </h1>
        </FadeUp>
        <FadeUp delay={0.04} className="mx-auto mt-5 max-w-2xl px-4">
          <p className="serif text-3xl leading-none text-fuchsia-900 sm:text-4xl md:text-5xl">
            Smart Event Planning and Resource Allocation Management System
          </p>
        </FadeUp>
        <FadeUp delay={0.08} className="mt-6 flex items-center justify-center gap-3">
          <span className="rounded-full bg-[#171411] px-3 py-1 text-[11px] text-white">Featured</span>
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full">
            <img alt="" src={photos[3]} className="h-full w-full object-cover" />
          </span>
          <p className="max-w-[160px] text-left text-[11px] leading-tight text-black/55">
            From Christina Baus S, II<sup>nd</sup> Msc — Dept. of Computer Science
          </p>
        </FadeUp>
      </section>

      <nav className="mx-auto mt-4 flex max-w-6xl flex-wrap items-center justify-center gap-2 px-6">
        {chips.map((c) => (
          <span key={c} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[12px] text-black/70">
            {c}
          </span>
        ))}
      </nav>

      <section className="mx-auto mt-8 grid max-w-6xl grid-cols-4 gap-3 px-6 sm:grid-cols-8">
        {photos.map((src, i) => (
          <motion.div
            key={src}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`overflow-hidden rounded-[28px] ${i === 0 ? 'col-span-2 row-span-2' : ''} ${i === 7 ? 'col-span-2' : ''}`}
          >
            <img src={src} alt="" className="h-28 w-full object-cover sm:h-32" style={{ height: i === 0 ? 180 : undefined }} />
          </motion.div>
        ))}
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-6">
        <p className="text-center text-2xl text-black/80 sm:text-3xl">
          Bringing Dreams to Life,
          <br />
          <span className="serif italic">One Event at a Time.</span>
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <HoverLift className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_-32px_rgba(0,0,0,0.25)]">
            <p className="text-xs text-black/45">Planning to memorable nights</p>
            <div className="mt-6 flex items-end justify-between">
              <svg viewBox="0 0 240 80" className="h-20 w-48">
                <path d="M0 50 C40 48 50 20 80 28 C110 36 120 10 160 18 C190 24 210 40 240 22" fill="none" stroke="#7c3aed" strokeWidth="3" />
              </svg>
              <p className="serif text-5xl">45.5%</p>
            </div>
            <p className="mt-2 text-[11px] text-black/40">Venue utilisation this term</p>
          </HoverLift>
          <div className="grid grid-cols-3 gap-3">
            {photos.slice(0, 6).map((src) => (
              <div key={src} className="overflow-hidden rounded-2xl">
                <img src={src} alt="" className="h-24 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-right text-xs text-black-50 text-black/45">Keep Planning<br />to Explore</p>
      </section>

      <section className="mx-auto mt-20 grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/40">Studio</p>
          <h2 className="serif mt-3 text-5xl leading-none sm:text-6xl">
            Your Story.
            <br />
            Our Stage.
          </h2>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-[32px]">
            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80" alt="" className="h-80 w-full object-cover" />
          </div>
          <span className="serif absolute left-6 top-10 text-5xl text-white/80">HOLD</span>
          <button className="absolute bottom-6 right-6 grid h-10 w-10 place-items-center rounded-full bg-white text-sm">↓</button>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="rounded-[36px] bg-[#eef3ea] px-8 py-12">
          <p className="text-center text-sm italic text-black/50">Campus programmes</p>
          <div className="mt-6 grid items-center gap-8 md:grid-cols-[auto_1fr_auto]">
            <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=300&q=80" alt="" className="h-40 w-40 rounded-[28px] object-cover" />
            <ul className="space-y-2 text-center">
              {['Seminars & Workshops', 'Product Launches', 'Festivals & Culture', 'Award Ceremonies', 'Sports Meets'].map((t) => (
                <li key={t} className="serif text-3xl sm:text-4xl">
                  {t}
                </li>
              ))}
            </ul>
            <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80" alt="" className="h-40 w-32 rounded-[28px] object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-6">
        <h2 className="serif text-4xl sm:text-5xl">
          Lasting memories,
          <br />
          one programme at a time.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            [photos[1], 'Orientation week', 'Open Ground'],
            [photos[4], 'Faculty symposium', 'Seminar Hall A'],
            ['https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80', 'Inter-college finals', 'Sports court'],
          ].map(([src, title, place]) => (
            <HoverLift key={title} className="overflow-hidden rounded-[28px] bg-white">
              <img src={src} alt="" className="h-56 w-full object-cover" />
              <div className="p-4">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-black/45">{place}</p>
              </div>
            </HoverLift>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-6">
        <h2 className="serif text-4xl">
          Feedback, reviews
          <br />
          and campus stories.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['The hall was ready before we were. Allocation just… worked.', 'Rohan D.', 'CSE'],
            ['I stopped chasing projectors on WhatsApp. Aura shows remaining stock.', 'Nila T.', 'IT'],
            ['Approvals used to take a week. Now the queue is visible.', 'Aanya S.', 'Admin'],
          ].map(([q, n, d]) => (
            <div key={n} className="rounded-[28px] bg-white p-6 shadow-sm">
              <p className="text-sm leading-relaxed text-black/70">“{q}”</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#171411]" />
                <div>
                  <p className="text-sm font-medium">{n}</p>
                  <p className="text-xs text-black/40">{d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-6xl items-center gap-8 px-6 md:grid-cols-2">
        <div>
          <h2 className="serif text-5xl">
            News, insights,
            <br />
            and more.
          </h2>
          <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm">
            How departments book a hall in under four minutes <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="overflow-hidden rounded-[32px]">
          <img src="https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1200&q=80" alt="" className="h-72 w-full object-cover" />
        </div>
      </section>

      <footer className="mt-24 bg-[#111111] px-6 pb-10 pt-16 text-[#f4efe6]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div className="flex items-center gap-2 text-sm">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-[11px] font-semibold text-black">A</span>
            Aura
          </div>
          <div className="grid grid-cols-3 gap-10 text-sm text-white/55">
            <div className="space-y-2">
              <p>Product</p>
              <p>Venues</p>
              <p>Equipment</p>
            </div>
            <div className="space-y-2">
              <p>Campus</p>
              <p>Departments</p>
              <p>Approvals</p>
            </div>
            <div className="space-y-2">
              <p>Contact</p>
              <p>hello@aura.edu</p>
              <p>Registry desk</p>
            </div>
          </div>
        </div>
        <p className="serif mx-auto mt-14 max-w-6xl text-[22vw] leading-none tracking-tight md:text-[180px]">Aura</p>
        <p className="mx-auto mt-4 max-w-6xl text-[11px] text-white/35">Smart Event Planning and Resource Allocation · PG Mini Project</p>
      </footer>
    </div>
  );
}
