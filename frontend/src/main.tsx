import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// For this test, we are removing Suspense and i18n to simplify.
// import './services/i18n';

// We are now re-introducing React.StrictMode.
// This is a standard and safe part of any React application.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
