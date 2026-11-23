import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/** Client-side gate. The Worker still checks the session on every API call. */
export default function RequireAuth({ children, redirectTo = '/login' }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="wrap section">
        <p style={{ color: 'var(--muted)' }}>Checking your session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  return children;
}
