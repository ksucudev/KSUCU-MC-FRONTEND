import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/environment';

export const useOverseerAuth = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const verify = async (): Promise<boolean> => {
    try {
      const response = await fetch(getApiUrl('overseer/verify'), {
        credentials: 'include',
      });
      const isValid = response.ok;
      setAuthenticated(isValid);
      if (isValid) {
        sessionStorage.setItem('adminAuth', 'authenticated');
      } else {
        sessionStorage.removeItem('adminAuth');
      }
      return isValid;
    } catch {
      setAuthenticated(false);
      sessionStorage.removeItem('adminAuth');
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(getApiUrl('overseer/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setAuthenticated(true);
        sessionStorage.setItem('adminAuth', 'authenticated');
        return { success: true };
      }
      return { success: false, message: data.message || 'Invalid password' };
    } catch {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch(getApiUrl('overseer/logout'), {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
  };

  useEffect(() => {
    verify().finally(() => setLoading(false));
  }, []);

  return { authenticated, loading, login, logout, verify };
};
