import { useEffect, useState, useContext } from 'react';
import {
  AppBar, Toolbar, Typography, Box,
  Container, IconButton, Tooltip, Snackbar, Alert
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ColorModeContext } from '../context/ThemeContext';
import SanskritS from '../components/Logo';
import api from '../api/axios';

const INACTIVITY_LIMIT = 60000; // 1 min
const WARNING_TIME = 10000; // 10s

const MainLayout = ({ title, children }) => {
  const { isAuthenticated, logout, username, showWarning, countdown } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const colorMode = useContext(ColorModeContext);
  const currentTheme = localStorage.getItem('themeMode') || 'light';
  const [env, setEnv] = useState('');

  // Fetch environment info
  useEffect(() => {
    api.get('/env')
      .then(res => setEnv(res.data.env))
      .catch(() => setEnv('unknown'));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hide navbar and warning on login/signup
  const hideNav = ['/login', '/signup'].includes(location.pathname);

  // Auto logout warning & timers handled in AuthContext; we just render warning here
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,rgb(99, 37, 88) 0%, #fcb69f 100%)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }}
    >
      {/* Environment Banner */}
      {env && (
        <Box sx={{
          backgroundColor: env === 'local' ? 'orange' : env === 'prod' ? 'red' : 'gray',
          color: 'white',
          textAlign: 'center',
          padding: '4px',
          fontWeight: 'bold'
        }}>
          {env.toUpperCase()} INSTANCE
        </Box>
      )}

      {/* Navbar */}
      {!hideNav && (
        <AppBar position="static" elevation={0} sx={{
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.1)',
        }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box display="flex" alignItems="center" gap={2} sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              <SanskritS size={40} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {title || 'Society Fest'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              {username && <Typography>{username}</Typography>}
              <Tooltip title="Toggle Theme">
                <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
                  {currentTheme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              {isAuthenticated && (
                <Tooltip title="Logout">
                  <IconButton color="inherit" onClick={handleLogout}>
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Inactivity Warning Snackbar */}
      {!hideNav && isAuthenticated && showWarning && (
        <Snackbar open anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="warning" sx={{ width: '100%' }}>
            ⚠ You will be logged out in {countdown} seconds due to inactivity.
          </Alert>
        </Snackbar>
      )}

      {/* Page Content */}
      <Box sx={{ py: 4 }}>
        <Container>{children}</Container>
      </Box>
    </div>
  );
};

export default MainLayout;
