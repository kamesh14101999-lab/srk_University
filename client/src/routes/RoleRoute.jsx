import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RoleRoute({ allow }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const allowed = user && allow.includes(user.role);

  useEffect(() => {
    if (user && !allowed) {
      showToast("You don't have access to that page", 'error');
    }
  }, [user, allowed, showToast]);

  if (!user) return <Navigate to="/login" replace />;
  if (!allowed) return <Navigate to={`/${user.role}`} replace />;

  return <Outlet />;
}
