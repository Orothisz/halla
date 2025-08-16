import { Navigate } from 'react-router-dom';
import { useSessionProfile } from '../hooks/useSessionProfile';

export default function ProtectedAdminRoute({ children }) {
  const { loading, session, profile } = useSessionProfile();

  if (loading) return <div className="p-6 text-sm opacity-70">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (profile?.role !== 'admin') return <Navigate to="/403" replace />;

  return children;
}
