import { useState, useEffect } from 'react';
import { AuthState } from '../types/shirt';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem('auth_state');
    if (stored) {
      try {
        setAuthState(JSON.parse(stored));
      } catch {
        localStorage.removeItem('auth_state');
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === 'admin' && password === 'admin123') {
      const newState = { isAuthenticated: true, isAdmin: true };
      setAuthState(newState);
      localStorage.setItem('auth_state', JSON.stringify(newState));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, isAdmin: false });
    localStorage.removeItem('auth_state');
  };

  return { ...authState, login, logout };
};