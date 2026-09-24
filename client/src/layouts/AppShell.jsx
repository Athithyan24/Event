import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  Boxes,
  Users,
  FileCheck,
  Bell,
  Search,
  LogOut,
  PanelLeft,
  Moon,
  Sun,
  Megaphone,
  BarChart3,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../store/auth';
import { useUi } from '../store/ui';
import CommandPalette from '../components/CommandPalette';
import NotificationDrawer from '../components/NotificationDrawer';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

const NAV = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/events', label: 'Events', icon: CalendarDays },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/app/venues', label: 'Venues', icon: Building2 },
  { to: '/app/equipment', label: 'Equipment', icon: Boxes },
  { to: '/app/approvals', label: 'Approvals', icon: FileCheck, admin: true },
  { to: '/app/departments', label: 'Departments', icon: MapPin, admin: true },
  { to: '/app/users', label: 'People', icon: Users, admin: true },
  { to: '/app/reports', label: 'Reports', icon: BarChart3 },
  { to: '/app/announcements', label: 'Bulletin', icon: Megaphone },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar, setCommand, setNotes, dark, toggleDark } = useUi();
  const navigate = useNavigate();
  const { data: notes } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/dashboard/notifications')).data,
  });
  const unread = (notes || []).filter((n) => !n.read).length;
  const items = NAV.filter((n) => !n.admin || user?.role === 'admin');

  return (
    <div className="flex min-h-screen bg-[#f3efe8] text-[#161412] dark:bg-[#121110] dark:text-[#f4efe6]">
      <motion.aside
        animate={{ width: sidebarCollapsed ? 76 : 248 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="sticky top-0 flex h-screen flex-col border-r border-black/8 bg-[#161412] text-[#f4efe6] dark:border-white/10"
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f4efe6] font-serif text-sm text-black">A</span>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="serif leading-none">Aura</p>
                <p className="text-[10px] text-white/40">Campus studio</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {({ isActive }) => (
                  <motion.span
                    whileHover={{ x: 3 }}
                    className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                      isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.span layoutId="activeNav" className="absolute left-0 top-2 h-6 w-[3px] rounded-full bg-[#c4a574]" />
                    )}
                    <Icon size={18} />
                    {!sidebarCollapsed && item.label}
                  </motion.span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="m-3 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/50 hover:bg-white/5"
        >
          <LogOut size={16} />
          {!sidebarCollapsed && 'Sign out'}
        </button>
      </motion.aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/8 bg-[#f3efe8]/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#121110]/80">
          <div className="flex items-center gap-2">
            <button onClick={toggleSidebar} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5">
              <PanelLeft size={16} />
            </button>
            <button
              onClick={() => setCommand(true)}
              className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-black/45 shadow-sm dark:bg-white/10 dark:text-white/50"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search campus…</span>
              <kbd className="ml-6 hidden rounded-md border border-black/10 px-1.5 text-[10px] sm:inline">⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDark} className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm dark:bg-white/10">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setNotes(true)} className="relative grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm dark:bg-white/10">
              <Bell size={16} />
              {unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#7b3fe4]" />}
            </button>
            <div className="ml-1 flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 shadow-sm dark:bg-white/10">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#161412] text-xs text-white">
                {user?.name?.[0] || 'A'}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-medium">{user?.name}</p>
                <p className="text-[10px] capitalize text-black/40 dark:text-white/40">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
      <NotificationDrawer />
    </div>
  );
}
