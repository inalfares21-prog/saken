import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

/**
 * Session state comes from the Worker: `/api/me` reads the Better Auth session
 * cookie and returns the profile row (id, role, name, email). Nothing is kept
 * in localStorage, and the role is stored server-side.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const profile = await api.me();
      setUser(profile);
      setError(null);
    } catch {
      setUser(null);
      setError('Could not reach the Saken server. Check that the API is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const chooseRole = useCallback(async (role) => {
    const profile = await api.setRole(role);
    setUser(profile);
    return profile;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      refresh,
      chooseRole,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, error, refresh, chooseRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
