import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, Users, DollarSign, Settings, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const userTabs = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Building2, label: 'Properties', path: '/dashboard/properties' },
    { icon: Users, label: 'Tenants', path: '/dashboard/tenants' },
    { icon: DollarSign, label: 'Payments', path: '/dashboard/payments' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' }
  ];

  const adminTabs = [
    { icon: Shield, label: 'Admin', path: '/admin' },
    { icon: Building2, label: 'Organizations', path: '/admin/organizations' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: DollarSign, label: 'Billing', path: '/admin/billing' },
    { icon: Settings, label: 'Settings', path: '/admin/profile' }
  ];

  const tabs = user?.role === 'Super Admin' || user?.role === 'Super Moderator' ? adminTabs : userTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-app-surface border-t border-app-border z-40 md:hidden">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                active 
                  ? 'text-brand-blue bg-brand-blue/10' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-xs font-medium mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;