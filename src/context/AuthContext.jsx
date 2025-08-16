import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { Snackbar, Alert } from '@mui/material';

export const AuthContext = createContext();

const INACTIVITY_LIMIT = 60000; // 1 min
const WARNING_TIME = 10000; // 10s
console.log('insinde auth context');

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_TIME / 1000);
  const [isActive, setIsActive] = useState(null);

  const logoutTimer = useRef();
  const warningTimer = useRef();
  const countdownInterval = useRef();

  const isAuthenticated = !!token;

  const clearTimers = () => {
    clearTimeout(logoutTimer.current);
    clearTimeout(warningTimer.current);
    clearInterval(countdownInterval.current);
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    setRole(null);
    clearTimers();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('lastActivity');
  };

  const signup = async (usernameInput, password, isActive) => {
    const res = await api.post('/auth/signup', { username: usernameInput, password, isActive });
    // depending on backend, it may auto-login user or just return success
  
    // If backend logs user in after signup:
    const newToken = res.data.token;
    const returnedUsername = res.data.username || usernameInput;
    const returnedRole = res.data.role || 'USER';
  
    setToken(newToken);
    setUsername(returnedUsername);
    setRole(returnedRole);
    setIsActive(isActive);
  
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', returnedUsername);
    localStorage.setItem('role', returnedRole);
    localStorage.setItem('lastActivity', Date.now().toString());
  };
  

  const login = async (usernameInput, password) => {
    const res = await api.post('/auth/login', { username: usernameInput, password });
    const newToken = res.data.token;
    const returnedUsername = res.data.username || usernameInput;
    const returnedRole = res.data.role || 'USER';

    setToken(newToken);
    setUsername(returnedUsername);
    setRole(returnedRole);

    localStorage.setItem('token', newToken);
    localStorage.setItem('username', returnedUsername);
    localStorage.setItem('role', returnedRole);
    localStorage.setItem('lastActivity', Date.now().toString());
  };

  // Reset timers on activity
  const resetTimers = () => {
    if (!isAuthenticated) return;

    clearTimers();
    setShowWarning(false);
    setCountdown(WARNING_TIME / 1000);

    localStorage.setItem('lastActivity', Date.now().toString());

    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      let timeLeft = WARNING_TIME / 1000;
      setCountdown(timeLeft);

      countdownInterval.current = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) clearInterval(countdownInterval.current);
      }, 1000);
    }, INACTIVITY_LIMIT - WARNING_TIME);

    logoutTimer.current = setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT);
  };

  // Setup event listeners for activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousemove', 'keydown', 'click'];
    events.forEach(ev => window.addEventListener(ev, resetTimers));

    // Restore lastActivity correctly on mount
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const diff = Date.now() - Number(lastActivity);
      if (diff >= INACTIVITY_LIMIT) {
        logout(); // session expired
      } else {
        resetTimers();
      }
    }

    return () => {
      clearTimers();
      events.forEach(ev => window.removeEventListener(ev, resetTimers));
    };
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ token, username, role, isAuthenticated,signup, login, logout, showWarning, countdown }}>
      {children}
      {isAuthenticated && showWarning && (
        <Snackbar open anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="warning" sx={{ width: '100%' }}>
            ⚠ You will be logged out in {countdown} seconds due to inactivity.
          </Alert>
        </Snackbar>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
