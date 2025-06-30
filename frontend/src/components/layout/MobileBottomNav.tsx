import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, DollarSign, Phone, LogIn, Building2, Users, CreditCard, MoreHorizontal, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  id: string;
  icon: any;
  label: string;
  path?: string;
  action?: () => void;
  isCenter?: boolean;
  isMore?: boolean;
}

interface MobileBottomNavProps {
  type: 'public' | 'dashboard';
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ type }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [showMore, setShowMore] = useState(false);

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const publicNavItems: NavItem[] = [
    { id: 'about', icon: Info, label: t('nav.about'), action: () => scrollToSection('about') },
    { id: 'pricing', icon: DollarSign, label: t('nav.pricing'), action: () => scrollToSection('pricing') },
    { id: 'login', icon: LogIn, label: t('nav.login'), path: '/login', isCenter: true },
    { id: 'contact', icon: Phone, label: t('nav.contact'), action: () => scrollToSection('contact') },
    { id: 'more', icon: MoreHorizontal, label: 'More', isMore: true }
  ];

  const dashboardNavItems: NavItem[] = [
    { id: 'properties', icon: Building2, label: t('dashboard.properties'), path: '/dashboard/properties' },
    { id: 'tenants', icon: Users, label: t('dashboard.tenants'), path: '/dashboard/tenants' },
    { id: 'overview', icon: Home, label: t('dashboard.overview'), path: '/dashboard/overview', isCenter: true },
    { id: 'payments', icon: CreditCard, label: t('dashboard.payments'), path: '/dashboard/payments' },
    { id: 'more', icon: MoreHorizontal, label: 'More', isMore: true }
  ];

  const moreItems = type === 'public' 
    ? [
        { id: 'features', label: 'Features', action: () => scrollToSection('features') },
        { id: 'services', label: 'Services', action: () => scrollToSection('services') },
        { id: 'leadership', label: 'Team', action: () => scrollToSection('leadership') }
      ]
    : [
        { id: 'expenses', label: t('dashboard.expenses'), path: '/dashboard/expenses' },
        { id: 'maintenance', label: t('dashboard.maintenance'), path: '/dashboard/maintenance' },
        { id: 'cashflow', label: t('dashboard.cash_flow'), path: '/dashboard/cashflow' },
        { id: 'settings', label: t('dashboard.settings'), path: '/dashboard/settings' }
      ];

  const navItems = type === 'public' ? publicNavItems : dashboardNavItems;
  const isActive = (item: NavItem) => {
    if (item.path) {
      return location.pathname === item.path || 
             (item.id === 'overview' && location.pathname === '/dashboard');
    }
    return false;
  };

  const NavButton: React.FC<{ item: NavItem }> = ({ item }) => {
    const active = isActive(item);
    const IconComponent = item.icon;

    if (item.isMore) {
      return (
        <button
          onClick={() => setShowMore(!showMore)}
          className="touch-target flex flex-col items-center justify-center p-2 transition-all duration-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="More options"
          aria-expanded={showMore}
        >
          <div className="p-2 rounded-xl">
            <IconComponent size={20} className="text-gray-600 dark:text-gray-400" />
          </div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
            {item.label}
          </span>
        </button>
      );
    }

    if (item.isCenter) {
      const centerContent = (
        <div className="touch-target flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105">
          {/* Improved center button */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform">
              <IconComponent size={28} className="text-white drop-shadow-sm" />
            </div>
            {active && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {item.label}
          </span>
        </div>
      );

      return item.path ? (
        <Link to={item.path} className="flex-1 flex justify-center">
          {centerContent}
        </Link>
      ) : (
        <button onClick={item.action} className="flex-1 flex justify-center">
          {centerContent}
        </button>
      );
    }

    const regularContent = (
      <div className="touch-target flex flex-col items-center justify-center p-2 transition-all duration-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
        <div className={`p-3 rounded-xl transition-colors ${
          active 
            ? 'bg-blue-100 dark:bg-blue-900 shadow-sm' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}>
          <IconComponent 
            size={22} 
            className={active 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-400'
            } 
          />
        </div>
        <span className={`text-xs font-medium mt-1 text-center ${
          active 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {item.label}
        </span>
        {active && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
        )}
      </div>
    );

    return item.path ? (
      <Link to={item.path} className="flex-1 flex justify-center">
        {regularContent}
      </Link>
    ) : (
      <button onClick={item.action} className="flex-1 flex justify-center">
        {regularContent}
      </button>
    );
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-2 gap-3">
              {moreItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setShowMore(false);
                    if (item.path) {
                      window.location.href = item.path;
                    } else if (item.action) {
                      item.action();
                    }
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        role="navigation"
        aria-label="Bottom navigation"
      >
        <div className="flex items-center justify-around px-2 py-2 safe-area-bottom max-w-md mx-auto">
          {navItems.map((item) => (
            <NavButton key={item.id} item={item} />
          ))}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;