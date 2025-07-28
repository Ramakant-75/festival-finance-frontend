// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const login = async (usernameInput, password) => {
    try {
      const res = await api.post('/auth/login', { username: usernameInput, password });
      const newToken = res.data.token;
      const returnedUsername = res.data.username || usernameInput;
      setToken(newToken);
      setUsername(returnedUsername);
      localStorage.setItem('token', newToken);
      localStorage.setItem('username', returnedUsername);
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('Unauthorized');
      }
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  const signup = async (username, password, role = 'USER') => {
    try {
      const res = await api.post('/auth/signup', { username, password, role });
      console.log("✅ User registered:", res.data);
    } catch (error) {
      console.error("❌ Signup error:", error);
      throw new Error('Signup failed');
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, signup, isAuthenticated, username }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
