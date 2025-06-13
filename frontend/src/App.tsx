import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// This is a simple placeholder for the dashboard content
const DashboardPlaceholder = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#111827',
        color: 'white',
        fontFamily: 'sans-serif',
        textAlign: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>Dashboard Test Page</h1>
        <p style={{ fontSize: '1.2rem', color: '#9ca3af' }}>If you can see this, the routing is working correctly.</p>
      </div>
    </div>
);

function App() {
  // This is the simplest possible routing setup to confirm the core libraries are working.
  // It removes all protected routes and other pages for this one test.
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPlaceholder />} />
      </Routes>
    </Router>
  );
}

export default App;
