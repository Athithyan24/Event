import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './store/auth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AppShell from './layouts/AppShell';
import Guard from './components/Guard';
import Dashboard from './pages/app/Dashboard';
import Events from './pages/app/Events';
import EventCreate from './pages/app/EventCreate';
import EventDetail from './pages/app/EventDetail';
import Venues from './pages/app/Venues';
import Equipment from './pages/app/Equipment';
import Departments from './pages/app/Departments';
import Users from './pages/app/Users';
import CalendarPage from './pages/app/CalendarPage';
import Approvals from './pages/app/Approvals';
import Reports from './pages/app/Reports';
import Announcements from './pages/app/Announcements';
import NotFound from './pages/NotFound';

const qc = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } });

function Boot({ children }) {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <Boot>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/app"
              element={
                <Guard>
                  <AppShell />
                </Guard>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="events" element={<Events />} />
              <Route path="events/new" element={<EventCreate />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="venues" element={<Venues />} />
              <Route path="equipment" element={<Equipment />} />
              <Route path="approvals" element={<Approvals />} />
              <Route path="departments" element={<Departments />} />
              <Route path="users" element={<Users />} />
              <Route path="reports" element={<Reports />} />
              <Route path="announcements" element={<Announcements />} />
            </Route>
            <Route path="/dashboard" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Boot>
    </QueryClientProvider>
  );
}
