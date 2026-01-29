import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../services/api';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await getMe();
      setUser(data.data);
    } catch (err) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchUser();
    else {
      setUser(null);
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (email, password) => {
    try {
      const { data } = await apiLogin(email, password);
      const t = data.token;
      localStorage.setItem('token', t);
      setToken(t);
      setUser(data.data);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await apiRegister(name, email, password);
      const t = data.token;
      localStorage.setItem('token', t);
      setToken(t);
      setUser(data.data);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
