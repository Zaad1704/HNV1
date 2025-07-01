import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building, Users, CreditCard, Settings, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const BottomNavBar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!isMobile) return null;

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/properties', icon: Building, label: 'Properties' },
    { href: '/dashboard/tenants', icon: Users, label: 'Tenants' },
    { href: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/overview';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-app-surface/95 backdrop-blur-md border-t border-app-border z-30 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              isActive(item.href)
                ? 'text-brand-blue bg-blue-50'
                : 'text-text-muted hover:text-text-primary hover:bg-app-bg'
            }`}
          >
            <item.icon size={20} />
            <span className="text-xs font-medium truncate">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;