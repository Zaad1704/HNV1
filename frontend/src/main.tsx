import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { useSecurityHeaders } from './hooks/useSecurityHeaders';
import App from './App';
import './i18n-simple';
import './index.css';

const SecureApp = () => {
  useSecurityHeaders();
  return <App />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Wait for i18n to initialize
const initApp = async () => {
  // Small delay to ensure i18n is loaded
  await new Promise(resolve => setTimeout(resolve, 100));
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LanguageProvider>
              <CurrencyProvider>
                <SecureApp />
              </CurrencyProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

initApp();

// Register service worker for PWA/TWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {

      })
      .catch((registrationError) => {

      });
  });
}