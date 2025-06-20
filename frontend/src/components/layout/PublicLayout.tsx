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
        {/* This Outlet renders the specific public page (Landing, Terms, etc.) */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
