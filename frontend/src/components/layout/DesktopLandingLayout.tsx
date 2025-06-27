import React from 'react';
import LandingHeroContent from '../landing/LandingHeroContent';

const DesktopLandingLayout: React.FC = () => {
  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  return (
    <div className="min-h-screen">
      <LandingHeroContent onGetStarted={handleGetStarted} />
    </div>
  );
};

export default DesktopLandingLayout;