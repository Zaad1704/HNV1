import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';

const queryClient = new QueryClient();

function MinimalApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
          <h1>Testing QueryClient</h1>
          <Routes>
            <Route path="*" element={<div>QueryClient + ThemeProvider + Router works</div>} />
          </Routes>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default MinimalApp;