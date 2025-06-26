import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useTranslation } from 'react-i18next';
import { 
  Menu, X, Home, Info, DollarSign, Phone, Users, 
  Shield, TrendingUp, Clock, Zap
} from 'lucide-react';

const MobileLandingLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: settings } = useSiteSettings();
  const { t } = useTranslation();

  const features = settings?.featuresPage?.features || [
    { icon: 'Shield', title: 'Secure', text: 'Bank-level security', sectionId: 'security' },
    { icon: 'Users', title: 'Management', text: 'Tenant management', sectionId: 'tenants' },
    { icon: 'TrendingUp', title: 'Analytics', text: 'Financial insights', sectionId: 'analytics' },
    { icon: 'Zap', title: 'Fast', text: 'Lightning fast', sectionId: 'performance' }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return Shield;
      case 'Users': return Users;
      case 'TrendingUp': return TrendingUp;
      case 'Zap': return Zap;
      default: return Shield;
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <header className="app-gradient sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="text-xl font-bold text-white">
            {settings?.logos?.companyName || 'HNV Solutions'}
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-app-bg z-40 pt-20">
          <nav className="p-4 space-y-4">
            {features.map((feature: any) => {
              const IconComponent = getIcon(feature.icon);
              return (
                <button
                  key={feature.sectionId}
                  onClick={() => scrollToSection(feature.sectionId)}
                  className="w-full flex items-center gap-3 p-4 bg-app-surface rounded-2xl border border-app-border"
                >
                  <IconComponent size={20} className="text-brand-blue" />
                  <div className="text-left">
                    <p className="font-semibold text-text-primary">{feature.title}</p>
                    <p className="text-sm text-text-secondary">{feature.text}</p>
                  </div>
                </button>
              );
            })}
            
            <div className="pt-4 space-y-2">
              <Link
                to="/login"
                className="block w-full text-center py-3 px-6 rounded-2xl border border-app-border text-text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.login')}
              </Link>
              <Link
                to="/register"
                className="block w-full text-center py-3 px-6 rounded-2xl btn-gradient text-white font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.get_started')}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MobileLandingLayout;