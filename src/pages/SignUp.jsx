import React, { useState, useContext } from 'react';
import { Box, Button, TextField, Typography, Alert, Snackbar, useTheme } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';

const Signup = () => {
  const { signup } = useContext(AuthContext);
  const theme = useTheme(); // 👈 get current theme
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
      const res = await api.get(`/auth/check-username`, { params: { username } });
      setUsernameAvailable(res.data);
    } catch (err) {
      setUsernameAvailable(null);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (usernameAvailable === false) {
      setError('❗ This username is already taken. Please choose a different one.');
      return;
    }
    if (form.username.length < 5) {
      setError('❗ Username must be at least 5 characters.');
      return;
    }

    try {
      await signup(form.username, form.password, form.role);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <MainLayout title="Sign Up">
      <Box
        maxWidth={400}
        mx="auto"
        mt={10}
        sx={{
          bgcolor: theme.palette.mode === 'light'
            ? 'rgba(255,255,255,0.85)'
            : 'rgba(30,30,30,0.85)', // dark mode fix
          color: theme.palette.text.primary, // adapt text color
          borderRadius: 4,
          p: 4,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}
      >
        <Typography variant="h4" align="center" color="inherit">Sign Up</Typography>
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            required
            value={form.username}
            onChange={async (e) => {
              const newUsername = e.target.value;
              setForm({ ...form, username: newUsername });
              await checkUsername(newUsername);
            }}
            helperText={
              form.username.length > 0 && form.username.length < 5
                ? '❗ Username must be at least 5 characters long'
                : checking
                ? 'Checking availability...'
                : usernameAvailable === true
                ? '✅ Username is available'
                : usernameAvailable === false
                ? '❌ Username is already taken'
                : ''
            }
            error={usernameAvailable === false || (form.username.length > 0 && form.username.length < 5)}
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
            disabled={
              usernameAvailable === false || checking || form.username.length < 5
            }
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

        <Typography variant="body2" align="center" mt={2} color="inherit">
          Already have an account?{' '}
          <Button variant="text" onClick={() => navigate('/login')}>
            Login here
          </Button>
        </Typography>
      </Box>
    </MainLayout>
  );
};

export default Signup;
