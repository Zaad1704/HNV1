// frontend/src/components/layout/PublicLayout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar'; // We will create this next
import Footer from './Footer';

const PublicLayout = () => {
  return (
    <div className="bg-slate-900">
      <Navbar />
      <main>
        {/* Outlet renders the matched child route component (Home, Features, etc.) */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
