import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '../constants/app';
import { authService } from '../services/authService';
import { useToast } from '../hooks/useToast';

export const AuthContext = createContext(null);

const readToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  // loading | authed | guest | error (server unreachable while restoring a session)
  const [status, setStatus] = useState(readToken() ? 'loading' : 'guest');

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStatus('guest');
  }, []);

  const restore = useCallback(async () => {
    if (!readToken()) { setStatus('guest'); return; }
    setStatus('loading');
    try {
      setUser(await authService.me());
      setStatus('authed');
    } catch (err) {
      if (err.response?.status === 401) clearSession();
      else setStatus('error');
    }
  }, [clearSession]);

  useEffect(() => { restore(); }, [restore]);

  useEffect(() => {
    const onExpired = () => { clearSession(); toast.info('Your session expired. Please log in again.'); };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [clearSession, toast]);

  const start = useCallback(({ token, user: u }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    setStatus('authed');
    return u;
  }, []);

  const value = useMemo(() => ({
    user, status, isAuthenticated: status === 'authed',
    login: async (creds) => start(await authService.login(creds)),
    register: async (data) => start(await authService.register(data)),
    logout: () => { clearSession(); toast.success('You have been logged out.'); },
    updateUser: setUser,
    applySession: start,
    retry: restore,
  }), [user, status, start, clearSession, restore, toast]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
