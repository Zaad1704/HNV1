import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

const queryClient = new QueryClient();

function MinimalApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>Testing LanguageProvider</h1>
            <Routes>
              <Route path="*" element={<div>All providers work</div>} />
            </Routes>
          </div>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default MinimalApp;