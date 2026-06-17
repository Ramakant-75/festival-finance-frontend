import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  Fab,
  Tooltip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import api from '../api/axios';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [forgotOpen, setForgotOpen] = useState(false);
  const [mailId, setMailId] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setShowSignup(false);
    setLoading(true);

    try {
      await login(form.username, form.password);
      navigate('/home');
    } catch (err) {
      if (
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        setError(err.response.data.message);
      } else {
        setError(
          'Wrong credentials. Please check your username and password.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!mailId.trim()) {
      setError('Please enter your registered email.');
      return;
    }

    setForgotLoading(true);

    try {
      await api.post('/auth/forgot-password', {
        mailId
      });

      setForgotSuccess(true);
      setForgotOpen(false);
      setMailId('');
    } catch (err) {
      setError(
        'Unable to send reset link. Please try again.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <MainLayout title="Login">
      {/* Floating Home Button */}
      <Tooltip title="Go to Welcome Page">
        <Fab
          aria-label="Home"
          color="primary"
          onClick={() => navigate('/')}
          sx={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            zIndex: 2000,
            boxShadow:
              '0 6px 16px rgba(0,0,0,0.25)',
            transition:
              'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform:
                'translateY(-2px) scale(1.06)',
              boxShadow:
                '0 12px 24px rgba(0,0,0,0.25)'
            }
          }}
        >
          <HomeIcon />
        </Fab>
      </Tooltip>

      <Box
        maxWidth={400}
        mx="auto"
        mt={10}
        sx={{
          bgcolor:
            theme.palette.mode === 'light'
              ? 'rgba(255,255,255,0.85)'
              : 'rgba(30,30,30,0.85)',
          color: theme.palette.text.primary,
          borderRadius: 4,
          p: 4,
          backdropFilter: 'blur(10px)',
          boxShadow:
            '0 8px 32px rgba(0,0,0,0.2)'
        }}
      >
        <Typography
          variant="h4"
          align="center"
          color="inherit"
        >
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}

            {showSignup && (
              <Button
                color="secondary"
                onClick={() =>
                  navigate('/signup')
                }
              >
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
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value
              })
            }
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            required
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 1
            }}
          >
            <Link
              component="button"
              variant="body2"
              onClick={() =>
                setForgotOpen(true)
              }
            >
              Forgot Password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
            startIcon={
              loading && (
                <CircularProgress size={20} />
              )
            }
          >
            {loading
              ? 'Logging in...'
              : 'Login'}
          </Button>
        </form>

        <Typography
          variant="body2"
          align="center"
          mt={2}
          color="inherit"
        >
          Don't have an account?{' '}
          <Button
            variant="text"
            onClick={() =>
              navigate('/signup')
            }
          >
            Sign up here
          </Button>
        </Typography>
      </Box>

      {/* Forgot Password Dialog */}

      <Dialog
        open={forgotOpen}
        onClose={() =>
          setForgotOpen(false)
        }
      >
        <DialogTitle>
          Forgot Password
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            sx={{ mb: 2 }}
          >
            Enter your registered email
            address. If it exists, we'll send
            you a password reset link.
          </Typography>

          <TextField
            autoFocus
            label="Registered Email"
            type="email"
            fullWidth
            value={mailId}
            onChange={(e) =>
              setMailId(e.target.value)
            }
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setForgotOpen(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleForgotPassword
            }
            disabled={forgotLoading}
          >
            {forgotLoading
              ? 'Sending...'
              : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={forgotSuccess}
        autoHideDuration={5000}
        onClose={() =>
          setForgotSuccess(false)
        }
        message="If the email exists, a reset link has been sent."
      />
    </MainLayout>
  );
};

export default Login;