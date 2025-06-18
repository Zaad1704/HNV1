import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // Re-adding the stylesheet import
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Create a new instance of QueryClient
const queryClient = new QueryClient();

// This is the correct structure for rendering a React app.
// We are re-introducing React.StrictMode as it is a best practice.
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
