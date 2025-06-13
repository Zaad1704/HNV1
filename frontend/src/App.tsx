import React from 'react';

// For this test, we are removing all routing and other component imports
// to create the simplest possible application.

function App() {
  return (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#111827',
        color: 'white',
        fontFamily: 'sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>Hello World!</h1>
        <p style={{ fontSize: '1.2rem', color: '#9ca3af' }}>If you can see this, the core application is loading correctly.</p>
        <p style={{ marginTop: '2rem', color: '#6b7280' }}>We can now proceed to the next debugging step.</p>
      </div>
    </div>
  );
}

export default App;
