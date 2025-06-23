import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Layouts ---
import PublicLayout from './components/layout/PublicLayout';

// --- Page Components (Lazy Loaded) ---
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
// NOTE: All protected pages are temporarily removed for this test.

const FullScreenLoader = () => (
    <div className="h-screen w-full flex items-center justify-center bg-brand-bg text-dark-text">
        <p>Loading...</p>
    </div>
);

function App() {
  // No session logic for now. We are only testing if the public pages render.
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
