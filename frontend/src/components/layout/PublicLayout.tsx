import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import PublicBottomNavBar from './PublicBottomNavBar';
import Footer from './Footer';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      <main className="pb-24 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <PublicBottomNavBar />
    </div>
  );
};

export default PublicLayout;
