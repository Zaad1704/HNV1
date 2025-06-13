import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// We are removing the import for index.css for this test
// to ensure it is not the source of the problem.

// This is the simplest possible way to render a React app.
// We have removed React.StrictMode to eliminate it as a potential issue for now.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
