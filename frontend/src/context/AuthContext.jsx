import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

// Helper to determine if a JWT has expired (1 hour limit)
const isTokenExpired = (jwtToken) => {
  if (!jwtToken) return true;
  try {
    const decoded = jwtDecode(jwtToken);
    if (!decoded.exp) return false;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken && !isTokenExpired(savedToken)) {
      return savedToken;
    }
    if (savedToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
    return null;
  });

  const [user, setUser] = useState(() => {
    try {
      const savedToken = localStorage.getItem('token');
      if (!savedToken || isTokenExpired(savedToken)) return null;
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Auto-logout timer when token hits 1-hour expiration
  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp) {
        const remainingTimeMs = decoded.exp * 1000 - Date.now();
        if (remainingTimeMs <= 0) {
          logout();
          window.location.href = '/login?expired=true';
          return;
        }

        const timerId = setTimeout(() => {
          logout();
          window.location.href = '/login?expired=true';
        }, remainingTimeMs);

        return () => clearTimeout(timerId);
      }
    } catch (err) {
      console.error('Failed to parse token expiration:', err);
    }
  }, [token]);

  // Restore fresh user profile on application mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken && !isTokenExpired(savedToken)) {
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
      } else if (savedToken && isTokenExpired(savedToken)) {
        logout();
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