import React, { useState, useContext } from 'react';
import {
  Box, Button, TextField, Typography, Alert,
  Snackbar
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Signup = () => {
  const { signup } = useContext(AuthContext);
  const [form, setForm] = useState({ username: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  const checkUsername = async (username) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
  
    setChecking(true);
    try {
      const res = await api.get(`/auth/check-username`, {
        params: { username }
      });
      setUsernameAvailable(res.data); // true if available
    } catch (err) {
      console.error('Username check failed', err);
      setUsernameAvailable(null);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    // block submission if username already taken
    if (usernameAvailable === false) {
      setError('❗ This username is already taken. Please choose a different one.');
      return;
    }
  
    try {
      await signup(form.username, form.password, form.role);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      // ✅ FIXED: Handle server 400 response properly
      if (err.response?.status === 400 && err.response.data === 'Username already exists') {
        setError('❗ This username is already taken. Please choose a different one.');
      } else {
        setError('Signup failed. Please try again.');
      }
    }
  };
  

  return (
    <Box maxWidth={400} mx="auto" mt={10}>
      <Typography variant="h4" align="center">Sign Up</Typography>
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          fullWidth margin="normal" required
          value={form.username}
          onChange={async (e) => {
            const newUsername = e.target.value;
            setForm({ ...form, username: newUsername });
            await checkUsername(newUsername);
          }}
          helperText={
            checking
              ? 'Checking availability...'
              : usernameAvailable === true
              ? '✅ Username is available'
              : usernameAvailable === false
              ? '❌ Username is already taken'
              : ''
          }
          error={usernameAvailable === false}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth margin="normal" required
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={usernameAvailable === false || checking}
          >
            Sign Up
          </Button>

      </form>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="🎉 Signup successful! Redirecting to login..."
      />

      <Typography variant="body2" align="center" mt={2}>
        Already have an account?{' '}
        <Button variant="text" onClick={() => navigate('/login')}>
          Login here
        </Button>
      </Typography>
    </Box>
  );
};

export default Signup;
