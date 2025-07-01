import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building, Users, CreditCard, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface MobileBottomNavProps {
  type?: 'dashboard' | 'public';
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ type = 'dashboard' }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const dashboardNavItems = [
    { href: '/dashboard', icon: Home, label: 'Overview' },
    { href: '/dashboard/properties', icon: Building, label: 'Properties' },
    { href: '/dashboard/tenants', icon: Users, label: 'Tenants' },
    { href: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' }
  ];

  const tenantNavItems = [
    { href: '/dashboard/tenant', icon: Home, label: 'Portal' },
    { href: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
    { href: '/dashboard/maintenance', icon: Settings, label: 'Requests' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' }
  ];

  const navItems = user?.role === 'Tenant' ? tenantNavItems : dashboardNavItems;

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/overview';
    }
    return location.pathname.startsWith(path);
  };

  if (type === 'public') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-app-surface/95 backdrop-blur-md border-t border-app-border z-30 safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-0 flex-1 ${
              isActive(item.href)
                ? 'text-brand-blue'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <item.icon size={20} />
            <span className="text-xs font-medium truncate">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;