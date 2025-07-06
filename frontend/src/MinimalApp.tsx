import React from 'react';
import { Routes, Route } from 'react-router-dom';

function MinimalApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Testing BrowserRouter</h1>
      <Routes>
        <Route path="*" element={<div>Router works</div>} />
      </Routes>
    </div>
  );
}

export default MinimalApp;