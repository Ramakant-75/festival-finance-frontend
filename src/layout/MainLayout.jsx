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
    navigate('/');
  };

  // Hide navbar and warning on login/signup
  const hideNav = ['/login', '/signup'].includes(location.pathname);

  // Map env to colors (added helper for clarity & more envs)
  const getEnvColor = (environment) => {
    switch (environment) {
      case 'local': return 'orange';
      case 'dev': return 'blue';
      case 'staging': return 'purple';
      case 'prod': return 'red';
      default: return 'gray';
    }
  };

  // Auto logout warning & timers handled in AuthContext; we just render warning here
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,rgb(21, 133, 231) 0%,rgb(240, 241, 233) 100%)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }}
    >
      {/* Environment Banner */}
      {env && (
        <Box sx={{
          backgroundColor: getEnvColor(env),
          color: 'white',
          textAlign: 'center',
          padding: '4px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          position: 'sticky',
          top: 0,
          zIndex: 1301
        }}>
          {env.toUpperCase()} ENVIRONMENT
        </Box>
      )}

      {/* Navbar */}
      {!hideNav && (
        <AppBar position="fixed" elevation={0} sx={{
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.1)',
          top: env ? '28px' : 0 // push down if banner exists
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
      <Box sx={{ py: 4, mt: hideNav ? 0 : 8 }}>
        <Container>{children}</Container>
      </Box>
    </div>
  );
};

export default MainLayout;
