import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { 
  Home, Building2, Users, DollarSign, Wrench, 
  TrendingUp, Bell, UserCheck, CreditCard, 
  FileText, Settings, LogOut, MoreHorizontal 
} from 'lucide-react';
import RoleGuard from '../RoleGuard';

const BottomNavBar = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const primaryNavItems = [
    { 
      href: '/dashboard/overview', 
      icon: Home, 
      label: t('dashboard.overview'),
      roles: ['Landlord', 'Agent', 'Tenant', 'Super Admin', 'Super Moderator']
    },
    { 
      href: '/dashboard/properties', 
      icon: Building2, 
      label: t('dashboard.properties'),
      roles: ['Landlord', 'Agent', 'Super Admin', 'Super Moderator']
    },
    { 
      href: '/dashboard/tenants', 
      icon: Users, 
      label: t('dashboard.tenants'),
      roles: ['Landlord', 'Agent', 'Super Admin', 'Super Moderator']
    },
    { 
      href: '/dashboard/payments', 
      icon: CreditCard, 
      label: 'Payments',
      roles: ['Landlord', 'Agent', 'Super Admin', 'Super Moderator']
    },
    { 
      icon: MoreHorizontal, 
      label: 'More',
      action: () => setShowMore(true),
      roles: ['Landlord', 'Agent', 'Tenant', 'Super Admin', 'Super Moderator']
    }
  ];

  const moreNavItems = [
    { 
      href: '/dashboard/expenses', 
      icon: DollarSign, 
      label: 'Expenses',
      roles: ['Landlord', 'Agent', 'Super Admin', 'Super Moderator']
    },
    { 
      href: '/dashboard/maintenance', 
      icon: Wrench, 
      label: t('dashboard.maintenance'),
      roles: ['Landlord', 'Agent', 'Tenant', 'Super Admin', 'Super Moderator']
    },
    { 
      href: '/dashboard/cashflow', 
      icon: TrendingUp, 
      label: t('dashboard.cash_flow'),
      roles: ['Landlord', 'Agent', 'Super Admin', 'Super Moderator']
    },
    { 
      href: '/dashboard/reminders', 
      icon: Bell, 
      label: t('dashboard.reminders'),
      roles: ['Landlord', 'Agent', 'Super Admin', 'Super Moderator']
    },
    { 
      href: '/dashboard/users', 
      icon: UserCheck, 
      label: t('dashboard.users_invites'),
      roles: ['Landlord', 'Super Admin', 'Super Moderator']
    },
    { 
      href: '/dashboard/billing', 
      icon: FileText, 
      label: t('dashboard.billing'),
      roles: ['Landlord', 'Super Admin', 'Super Moderator']
    },
    { 
      href: '/admin', 
      icon: Settings, 
      label: t('dashboard.admin_panel'),
      roles: ['Super Admin', 'Super Moderator']
    },
    { 
      href: '/dashboard/settings', 
      icon: Settings, 
      label: t('dashboard.settings'),
      roles: ['Landlord', 'Agent', 'Tenant', 'Super Admin', 'Super Moderator']
    },
    { 
      action: handleLogout, 
      icon: LogOut, 
      label: t('dashboard.logout'),
      roles: ['Landlord', 'Agent', 'Tenant', 'Super Admin', 'Super Moderator']
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard/overview') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/overview';
    }
    return location.pathname === href;
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 app-surface border-t border-app-border backdrop-blur-md">
        <div className="grid grid-cols-5 h-20">
          {primaryNavItems.map((item) => (
            <RoleGuard key={item.label} allowed={item.roles || []}>
              {item.href ? (
                <Link
                  to={item.href}
                  className={`flex flex-col items-center justify-center transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-brand-blue bg-brand-blue/10 rounded-t-3xl mx-1 mt-1'
                      : 'text-text-secondary hover:text-text-primary active:scale-95'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-xs font-medium mt-1">{item.label}</span>
                </Link>
              ) : (
                <button
                  onClick={item.action}
                  className="flex flex-col items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-300 active:scale-95"
                >
                  <item.icon size={20} />
                  <span className="text-xs font-medium mt-1">{item.label}</span>
                </button>
              )}
            </RoleGuard>
          ))}
        </div>
      </nav>

      {/* More Menu Modal */}
      {showMore && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full app-surface rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary">More Options</h3>
              <button
                onClick={() => setShowMore(false)}
                className="p-2 rounded-full text-text-secondary hover:text-text-primary"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {moreNavItems.map((item) => (
                <RoleGuard key={item.label} allowed={item.roles || []}>
                  {item.href ? (
                    <Link
                      to={item.href}
                      onClick={() => setShowMore(false)}
                      className="flex flex-col items-center p-4 rounded-2xl bg-app-bg hover:bg-app-border transition-colors"
                    >
                      <item.icon size={24} className="text-brand-blue mb-2" />
                      <span className="text-sm font-medium text-text-primary text-center">{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        item.action?.();
                        setShowMore(false);
                      }}
                      className="flex flex-col items-center p-4 rounded-2xl bg-app-bg hover:bg-app-border transition-colors"
                    >
                      <item.icon size={24} className="text-brand-blue mb-2" />
                      <span className="text-sm font-medium text-text-primary text-center">{item.label}</span>
                    </button>
                  )}
                </RoleGuard>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNavBar;