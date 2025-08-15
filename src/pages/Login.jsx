import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, useTheme } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // reset error every attempt
    setShowSignup(false);
    setLoading(true);

    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Invalid credentials';
      setError(msg);
      if (msg.includes('sign up')) {
        setShowSignup(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Login">
      <Box
        maxWidth={400}
        mx="auto"
        mt={10}
        sx={{
          bgcolor: theme.palette.mode === 'light'
            ? 'rgba(255,255,255,0.85)'
            : 'rgba(30,30,30,0.85)',
          color: theme.palette.text.primary,
          borderRadius: 4,
          p: 4,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}
      >
        <Typography variant="h4" align="center" color="inherit">Login</Typography>

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
            {showSignup && (
              <Button color="secondary" onClick={() => navigate('/signup')}>
                Sign up
              </Button>
            )}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            required
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            required
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <Typography variant="body2" align="center" mt={2} color="inherit">
          Don't have an account?{' '}
          <Button variant="text" onClick={() => navigate('/signup')}>
            Sign up here
          </Button>
        </Typography>
      </Box>
    </MainLayout>
  );
};

export default Login;
