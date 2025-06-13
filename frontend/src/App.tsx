import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// We are now re-importing only the LoginPage to test it in isolation.
import LoginPage from './pages/LoginPage.tsx';

function App() {
  // This version re-introduces routing and only the Login Page.
  // This will test if the routing library or the LoginPage component is the source of the crash.
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
