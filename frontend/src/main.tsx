import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// This is the simplest possible way to render a React app.
// We have removed React.StrictMode and Suspense for now to ensure a clean start.
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <App />
  );
} else {
  console.error("Failed to find the root element. Make sure your index.html has a div with id='root'.");
}
