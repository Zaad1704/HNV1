import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import PublicMobileHeader from './PublicMobileHeader';
import MobileBottomNav from './MobileBottomNav';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const PublicLayout = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <div className="min-h-screen bg-app-bg">
        <PublicMobileHeader />
        <main className="pt-16 pb-4">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;