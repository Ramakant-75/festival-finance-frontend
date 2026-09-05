import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ThemeContextProvider from './context/ThemeContext';
import { CelebrationProvider } from './context/CelebrationContext';  // ✅ import new provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeContextProvider>
    <CelebrationProvider>   {/* ✅ wrap app inside CelebrationProvider */}
      <App />
    </CelebrationProvider>
  </ThemeContextProvider>
);
