import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'token';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${API_URL}/admin/me`);
      const data = response.data?.data;
      
      if (data?.role !== 'admin') {
        logout();
        return;
      }
      
      setUser(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchUser();
  }, [token, fetchUser]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/admin/login`, { email, password });
      const { token: t, data } = response.data;
      
      if (data?.role !== 'admin') {
        return {
          success: false,
          message: 'Admin access only. This panel is restricted to administrators.'
        };
      }
      
      localStorage.setItem(TOKEN_KEY, t);
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      setToken(t);
      setUser(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (name, email, password, adminKey) => {
    try {
      if (!name || !email || !password || !adminKey) {
        return {
          success: false,
          message: 'All fields including admin secret key are required'
        };
      }

      const response = await axios.post(`${API_URL}/admin/signup`, {
        name,
        email,
        password,
        adminKey
      });
      
      const { token: t, data } = response.data;
      
      if (data?.role !== 'admin') {
        return {
          success: false,
          message: 'Registration failed. Admin role not assigned.'
        };
      }
      
      localStorage.setItem(TOKEN_KEY, t);
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      setToken(t);
      setUser(data);
      return { success: true };
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 403) {
        return {
          success: false,
          message: message || 'Invalid admin secret key. Please check and try again.'
        };
      } else if (status === 400) {
        return {
          success: false,
          message: message || 'Invalid input. User may already exist.'
        };
      }

      return {
        success: false,
        message: message || 'Registration failed. Please try again.'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
