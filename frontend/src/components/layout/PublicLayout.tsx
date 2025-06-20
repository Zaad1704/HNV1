// frontend/src/components/layout/PublicLayout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from './Footer';

const PublicLayout = () => {
  return (
    <div className="bg-slate-900">
      <Navbar />
      <main>
        {/* The Navbar component has the logo which links to "/" */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
