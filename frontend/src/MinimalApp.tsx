import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));

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
      <h1>Testing Lazy Loading</h1>
      <Suspense fallback={<div>Loading page...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<div>404</div>} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default MinimalApp;