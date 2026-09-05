import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import api from '../api/axios';

const ResetPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!token) {
      setError(
        'Invalid password reset link. Please request a new one.'
      );
      return;
    }

    if (form.newPassword.length < 6) {
      setError(
        'Password must be at least 6 characters long.'
      );
      return;
    }

    if (
      form.newPassword !== form.confirmPassword
    ) {
      setError(
        'Passwords do not match.'
      );
      return;
    }

    setLoading(true);

    try {
      await api.post(
        '/auth/reset-password',
        {
          token,
          newPassword:
            form.newPassword
        }
      );

      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      if (
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        setError(
          err.response.data.message
        );
      } else {
        setError(
          'Password reset link is invalid or has expired.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Reset Password">
      <Box
        maxWidth={450}
        mx="auto"
        mt={10}
        sx={{
          bgcolor:
            theme.palette.mode ===
            'light'
              ? 'rgba(255,255,255,0.85)'
              : 'rgba(30,30,30,0.85)',
          color:
            theme.palette.text.primary,
          borderRadius: 4,
          p: 4,
          backdropFilter:
            'blur(10px)',
          boxShadow:
            '0 8px 32px rgba(0,0,0,0.2)'
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
        >
          Reset Password
        </Typography>

        <Typography
          variant="body2"
          align="center"
          sx={{ mb: 3 }}
        >
          Please enter your new
          password below.
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <form
          onSubmit={handleSubmit}
        >
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            required
            value={
              form.newPassword
            }
            onChange={(e) =>
              setForm({
                ...form,
                newPassword:
                  e.target.value
              })
            }
          />

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            required
            value={
              form.confirmPassword
            }
            onChange={(e) =>
              setForm({
                ...form,
                confirmPassword:
                  e.target.value
              })
            }
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
            startIcon={
              loading && (
                <CircularProgress
                  size={20}
                />
              )
            }
          >
            {loading
              ? 'Resetting...'
              : 'Reset Password'}
          </Button>
        </form>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 3 }}
        >
          Remembered your
          password?
          <Button
            variant="text"
            onClick={() =>
              navigate(
                '/login'
              )
            }
          >
            Login
          </Button>
        </Typography>
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        message="🎉 Password reset successful! Redirecting to login..."
        onClose={() =>
          setSuccess(false)
        }
      />
    </MainLayout>
  );
};

export default ResetPassword;