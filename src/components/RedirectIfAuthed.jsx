import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function RedirectIfAuthed({ children, to = "/admin" }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-[50vh] grid place-items-center">Loading…</div>;
  if (user) return <Navigate to={to} replace />;
  return children;
}
