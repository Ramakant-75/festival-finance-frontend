import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Box, Container, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ColorModeContext } from '../context/ThemeContext'; // ⬅️ Import this

const MainLayout = ({ title, children }) => {
  const { isAuthenticated, logout, username } = useAuth();
  const navigate = useNavigate();
  const colorMode = useContext(ColorModeContext); // ⬅️ Access toggle
  const currentTheme = localStorage.getItem('themeMode') || 'light';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            🏘️ {title || 'Society Fest'}
          </Typography>

          <Box display="flex" alignItems="center" gap={2}>
            {username && <Typography>{username}</Typography>}

            {/* Theme Toggle Button */}
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

      <Box sx={{ py: 4 }}>
        <Container>{children}</Container>
      </Box>
    </>
  );
};

export default MainLayout;
