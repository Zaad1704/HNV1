// frontend/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- THIS IS THE CRITICAL FIX ---
// This line imports and runs the i18next configuration for the entire app.
import './services/i18n.js'; 
// --------------------------------

// 1. Create a new instance of QueryClient
const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {/* 2. Wrap your App component with the QueryClientProvider */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
} else {
  console.error("Fatal Error: The root element with id='root' was not found in the DOM.");
}
