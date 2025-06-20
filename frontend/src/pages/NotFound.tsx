// frontend/src/pages/NotFound.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <AlertTriangle className="w-16 h-16 text-yellow-400 mb-6" />
      <h1 className="text-5xl font-extrabold mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-slate-400 max-w-md text-center mb-8">
        Sorry, the page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-colors"
      >
        Return to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
