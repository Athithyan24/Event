import { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiCalendar, FiBox, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { Button } from "@/components/ui/button";

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome /> },
    { name: 'Events', path: '/events', icon: <FiCalendar /> },
    { name: 'Allocations', path: '/allocations', icon: <FiBox /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden">
      <aside className="hidden md:flex w-64 flex-col glass-panel m-4 z-10">
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            SmartPlanner
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-2">
          <Button 
            variant="ghost" 
            onClick={() => setDarkMode(!darkMode)} 
            className="w-full justify-start text-gray-500 dark:text-gray-400"
          >
            {darkMode ? <FiSun className="mr-2 text-amber-400" /> : <FiMoon className="mr-2 text-indigo-500" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>

          <Button variant="ghost" onClick={() => { localStorage.removeItem('token'); navigate('/login', { replace: true }); }} className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
            <FiLogOut className="mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}