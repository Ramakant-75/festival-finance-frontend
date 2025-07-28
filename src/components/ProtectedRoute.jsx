import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, token } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setUserRole(res.data.role);
        })
        .catch(() => setUserRole(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (loading) return null;

  if (adminOnly && userRole !== 'ADMIN') return <Navigate to="/" />;
  return children;
};

export default ProtectedRoute;
