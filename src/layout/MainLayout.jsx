// src/layouts/MainLayout.jsx
import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Box, Container, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ColorModeContext } from '../context/ThemeContext';
import SanskritS from '../components/Logo'; // ✅ Using your animated SVG logo

const MainLayout = ({ title, children }) => {
  const { isAuthenticated, logout, username } = useAuth();
  const navigate = useNavigate();
  const colorMode = useContext(ColorModeContext);
  const currentTheme = localStorage.getItem('themeMode') || 'light';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,rgb(99, 37, 88) 0%, #fcb69f 100%)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }}
    >
      {/* Navbar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          animation: 'slideDown 0.6s ease-out',
          '@keyframes slideDown': {
            from: { transform: 'translateY(-100%)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 },
          },
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo + Title */}
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <SanskritS size={40} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {title || 'Society Fest'}
            </Typography>
          </Box>

          {/* Right-side controls */}
          <Box display="flex" alignItems="center" gap={2}>
            {username && <Typography>{username}</Typography>}

            {/* Theme Toggle */}
            <Tooltip title="Toggle Theme">
              <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
                {currentTheme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* Logout */}
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

      {/* Page Content */}
      <Box sx={{ py: 4 }}>
        <Container
          sx={{
            animation: 'fadeUp 0.6s ease-out',
            '@keyframes fadeUp': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          {children}
        </Container>
      </Box>
    </div>
  );
};

export default MainLayout;
