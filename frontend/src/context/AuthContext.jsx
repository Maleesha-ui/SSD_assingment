import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Restore user session on application load or token change
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await api.get('/auth/me');
          const userData = response.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('role', userData.role);
        } catch (error) {
          console.error('Failed to restore user session:', error);
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const applyAuthSession = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userData.role || 'customer');
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, ...userData } = response.data;

      applyAuthSession(receivedToken, userData);
      return userData.role;
    } catch (error) {
      throw error;
    }
  };

  const googleLoginWithToken = async (credential) => {
    try {
      const response = await api.post('/auth/google-token', { credential });
      const { token: receivedToken, user: receivedUser, isNewUser, isProfileComplete } = response.data;
      
      applyAuthSession(receivedToken, receivedUser);
      return { token: receivedToken, user: receivedUser, isNewUser, isProfileComplete };
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      logout, 
      applyAuthSession, 
      googleLoginWithToken, 
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);