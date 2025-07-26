import React, { createContext, useMemo, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('themeMode');
    if (saved) setMode(saved);
  }, []);

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode(prev => {
        const next = prev === 'light' ? 'dark' : 'light';
        localStorage.setItem('themeMode', next);
        return next;
      });
    }
  }), []);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9'
      },
      background: {
        default: mode === 'light' ? '#f9f9f9' : '#121212',
        paper: mode === 'light' ? '#fff' : '#1e1e1e'
      }
    }
  }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ThemeContextProvider;
