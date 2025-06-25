// frontend/src/components/layout/PublicLayout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from './Footer';
import PublicBottomNavBar from './PublicBottomNavBar'; // Import the new bottom nav

const PublicLayout = () => {
  return (
    <div className="bg-light-bg dark:bg-dark-bg transition-colors duration-300"> {/* Set background to semantic, added dark mode and transition */}
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      {/* Render PublicBottomNavBar only on screens smaller than md */}
      <PublicBottomNavBar />
    </div>
  );
};

export default PublicLayout;
