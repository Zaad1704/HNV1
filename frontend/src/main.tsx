import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// For this test, we are removing Suspense and i18n to simplify.
// import './services/i18n';

// We are also removing React.StrictMode to eliminate it as a potential issue.
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
