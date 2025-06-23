import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { LangProvider } from './contexts/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';

import './services/i18n.js';
import './index.css';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            {/* FIX: LangProvider and ThemeProvider are restored here */}
            <ThemeProvider>
              <LangProvider>
                <App />
              </LangProvider>
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error("Fatal Error: The root element with id='root' was not found in the DOM.");
}
