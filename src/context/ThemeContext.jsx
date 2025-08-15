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

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode(prev => {
          const next = prev === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', next);
          return next;
        });
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#1976d2' : '#90caf9',
          },
          background: {
            default: mode === 'light' ? '#f9f9f9' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
          text: {
            primary: mode === 'light' ? '#000000' : '#ffffff',
            secondary: mode === 'light' ? '#555555' : '#e0e0e0',
          },
        },
        typography: {
          allVariants: {
            color: mode === 'light' ? '#000000' : '#ffffff',
          },
        },
        components: {
          MuiTableCell: {
            styleOverrides: {
              root: {
                color: mode === 'light' ? '#000000' : '#ffffff', // Table text
                borderColor: mode === 'light' ? '#ddd' : '#444', // Table borders
              },
              head: {
                fontWeight: 'bold',
                color: mode === 'light' ? '#000000' : '#ffffff',
              },
            },
          },
          MuiInputBase: {
            styleOverrides: {
              root: {
                color: mode === 'light' ? '#000000' : '#ffffff', // Input text
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                color: mode === 'light' ? '#000000' : '#ffffff', // Button label text
              },
            },
          },
        },
      }),
    [mode]
  );

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
