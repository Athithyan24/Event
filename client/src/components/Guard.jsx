import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function Guard({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-black/40">Opening studio…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />;
  return children;
}
