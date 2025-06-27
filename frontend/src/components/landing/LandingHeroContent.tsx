import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../contexts/LanguageContext';

interface LandingHeroContentProps {
  onGetStarted: () => void;
}

const LandingHeroContent: React.FC<LandingHeroContentProps> = ({ onGetStarted }) => {
  const { t } = useTranslation();
  const { currencyName } = useLang();
  const [visionImage, setVisionImage] = useState<string>('');

  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.heroSection?.visionImageUrl) {
          setVisionImage(data.data.heroSection.visionImageUrl);
        }
      })
      .catch(console.error);
  }, []);

  const features = [
    {
      icon: '🏠',
      title: t('dashboard.properties'),
      description: t('landing.properties_desc'),
      link: '#properties',
      position: 'top-20 left-10'
    },
    {
      icon: '👥',
      title: t('dashboard.tenants'),
      description: t('landing.tenants_desc'),
      link: '#tenants',
      position: 'top-32 right-16'
    },
    {
      icon: '💰',
      title: t('dashboard.cash_flow'),
      description: t('landing.cashflow_desc'),
      link: '#cashflow',
      position: 'bottom-40 left-20'
    },
    {
      icon: '🔧',
      title: t('dashboard.maintenance'),
      description: t('landing.maintenance_desc'),
      link: '#maintenance',
      position: 'bottom-20 right-10'
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-blue-600 to-purple-700 overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Scattered Feature Cards */}
      {features.map((feature, index) => (
        <div
          key={index}
          onClick={() => scrollToSection(feature.link)}
          className={`absolute ${feature.position} bg-white/10 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all duration-300 transform hover:scale-110 hover:rotate-3 z-10 max-w-48`}
        >
          <div className="text-3xl mb-2 text-center">{feature.icon}</div>
          <h3 className="text-white font-bold text-sm mb-1 text-center">{feature.title}</h3>
          <p className="text-gray-200 text-xs text-center">{feature.description}</p>
        </div>
      ))}

      <div className="relative z-20 text-center px-4">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-tight">
            HNV
          </h1>
          <p className="text-2xl md:text-3xl text-orange-200 font-light mb-2">
            {t('landing.hero_subtitle')}
          </p>
          <p className="text-lg text-blue-200">
            {t('landing.hero_description')}
          </p>
        </div>
        
        <button
          onClick={onGetStarted}
          className="inline-flex items-center px-12 py-4 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white font-bold text-xl rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          {t('landing.hero_cta')}
          <svg className="ml-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Vision Image Section */}
      {visionImage && (
        <div className="absolute bottom-10 right-10 z-10">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl w-80 h-48">
            <img
              src={visionImage}
              alt="Property Management Vision"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-bold mb-1">{t('landing.vision_title')}</h3>
              <p className="text-sm text-gray-200">{t('landing.vision_subtitle')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingHeroContent;