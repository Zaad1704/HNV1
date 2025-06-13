import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // This line imports all the Tailwind CSS styles

// We will add React.StrictMode back in as it's a best practice
// and we've confirmed it's not the source of the blank page issue.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

}
