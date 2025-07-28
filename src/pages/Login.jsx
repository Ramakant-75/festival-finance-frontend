// src/pages/Login.jsx
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      if (err.message === 'Unauthorized') {
        setError('Looks like you are a new user 😊. Want to sign up?');
        setShowSignup(true);
      } else {
        setError('Invalid credentials');
        setShowSignup(false);
      }
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={10}>
      <Typography variant="h4" align="center">Login</Typography>
      
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
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
      <Typography variant="body2" align="center" mt={2}>
        Don't have an account?{' '}
        <Button variant="text" onClick={() => navigate('/signup')}>
          Sign up here
        </Button>
      </Typography>

    </Box>
  );
};

export default Login;
