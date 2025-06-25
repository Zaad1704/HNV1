// frontend/src/pages/NotFound.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark p-4 transition-colors duration-300">
      <AlertTriangle className="w-16 h-16 text-brand-accent-dark mb-6" />
      <h1 className="text-5xl font-extrabold mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-light-text dark:text-light-text-dark max-w-md text-center mb-8">
        Sorry, the page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary transition-colors duration-200"
      >
        Return to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
