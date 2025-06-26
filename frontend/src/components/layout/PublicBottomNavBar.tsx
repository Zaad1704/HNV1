import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, DollarSign, Phone, LogIn, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PublicBottomNavBar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { 
      id: 'home', 
      icon: Home, 
      label: t('nav.home'), 
      action: () => scrollToSection('hero') 
    },
    { 
      id: 'about', 
      icon: Info, 
      label: t('nav.about'), 
      action: () => scrollToSection('about') 
    },
    { 
      id: 'login', 
      icon: LogIn, 
      label: t('nav.login'), 
      isHighlighted: true,
      link: '/login'
    },
    { 
      id: 'pricing', 
      icon: DollarSign, 
      label: t('nav.pricing'), 
      action: () => scrollToSection('pricing') 
    },
    { 
      id: 'contact', 
      icon: Phone, 
      label: t('nav.contact'), 
      action: () => scrollToSection('contact') 
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 app-surface border-t border-app-border">
      <div className="grid grid-cols-5 h-20">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          
          if (item.link) {
            return (
              <Link
                key={item.id}
                to={item.link}
                className={`flex flex-col items-center justify-center transition-all duration-300 ${
                  item.isHighlighted 
                    ? 'app-gradient text-white rounded-t-3xl mx-2 mt-2 shadow-app-lg' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <IconComponent size={20} />
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              onClick={item.action}
              className="flex flex-col items-center justify-center text-text-secondary hover:text-text-primary transition-colors duration-300"
            >
              <IconComponent size={20} />
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default PublicBottomNavBar;