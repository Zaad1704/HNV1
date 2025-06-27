import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../contexts/LanguageContext';
import { ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';

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
      description: 'Manage all your properties in one place',
      link: '#properties'
    },
    {
      icon: '👥',
      title: t('dashboard.tenants'),
      description: 'Track tenant information and communications',
      link: '#tenants'
    },
    {
      icon: '💰',
      title: t('dashboard.cash_flow'),
      description: 'Monitor income and expenses',
      link: '#cashflow'
    },
    {
      icon: '🔧',
      title: t('dashboard.maintenance'),
      description: 'Handle maintenance requests efficiently',
      link: '#maintenance'
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute inset-0 opacity-20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t('landing.hero_title')}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              {t('landing.hero_subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {t('landing.hero_cta')}
                <ChevronRightIcon className="ml-2 h-5 w-5" />
              </button>
              
              <button className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all duration-200">
                <PlayIcon className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={() => scrollToSection(feature.link)}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-gray-300 text-xs">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {visionImage && (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={visionImage}
                  alt="Property Management Vision"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">Modern Management</h3>
                  <p className="text-gray-200">Streamline your workflow with our intuitive platform</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingHeroContent;