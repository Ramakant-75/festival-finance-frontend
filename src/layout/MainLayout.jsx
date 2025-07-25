import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { ColorModeContext } from '../context/ThemeContext';

const MainLayout = ({ title = 'Society Festival Portal', children }) => {
  const colorMode = useContext(ColorModeContext);
  const currentMode = localStorage.getItem('themeMode') || 'light';

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">{title}</Typography>

          <IconButton onClick={colorMode.toggleColorMode} color="inherit">
            <Box sx={{ position: 'relative', width: 24, height: 24 }}>
              <Brightness4 sx={{
                position: 'absolute',
                opacity: currentMode === 'light' ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }} />
              <Brightness7 sx={{
                position: 'absolute',
                opacity: currentMode === 'dark' ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }} />
            </Box>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ py: 4 }}>
        {children}
      </Box>
    </>
  );
};

export default MainLayout;
