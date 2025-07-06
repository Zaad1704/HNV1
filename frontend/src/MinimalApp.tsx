import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoadingSpinner from './components/common/LoadingSpinner';

function MinimalApp() {
  const { token, user } = useAuthStore();
  const [isSessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    setSessionLoading(false);
  }, []);

  if (isSessionLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Testing App Structure</h1>
      <p>Token: {token ? 'exists' : 'none'}</p>
      <p>User: {user?.name || 'none'}</p>
      <Routes>
        <Route path="*" element={<div>Basic App works</div>} />
      </Routes>
    </div>
  );
}

export default MinimalApp;