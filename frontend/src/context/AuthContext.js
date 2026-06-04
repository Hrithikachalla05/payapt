import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const logout = useCallback(() => {
    localStorage.removeItem('payapt_token');
    setUser(null);
  }, []);

  // Session timeout checker
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && Date.now() - lastActivity > SESSION_TIMEOUT) {
        logout();
        alert('Session expired due to inactivity. Please login again.');
      }
    }, 60000); // check every minute
    return () => clearInterval(interval);
  }, [user, lastActivity, logout]);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('payapt_token');
    if (token) {
      API.get('/auth/me')
        .then((res) => setUser(res.data.user))
        .catch(() => localStorage.removeItem('payapt_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('payapt_token', token);
    setUser(userData);
    setLastActivity(Date.now());
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);