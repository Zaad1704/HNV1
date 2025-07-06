import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';

function MinimalApp() {
  return (
    <ThemeProvider>
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>Testing ThemeProvider</h1>
        <Routes>
          <Route path="*" element={<div>ThemeProvider + Router works</div>} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default MinimalApp;