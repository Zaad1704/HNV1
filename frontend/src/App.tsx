import React from 'react';

// This is the simplest possible React component.
// It uses inline styles to avoid any dependency on external CSS files.
function App() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', color: '#333' }}>
      <h1>Hello from React!</h1>
      <p>If you see this, the core rendering is working.</p>
    </div>
  );
}

export default App;
