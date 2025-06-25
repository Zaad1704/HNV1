// frontend/src/components/layout/PublicLayout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../layout/Navbar'; // Corrected path
import Footer from './Footer';

const PublicLayout = () => {
  return (
    <div className="bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
