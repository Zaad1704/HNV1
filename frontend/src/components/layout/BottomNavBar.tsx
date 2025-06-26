import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { Home, Building2, Users, CreditCard, MoreHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BottomNavBar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);

  const mainNavItems = [
    { 
      path: '/dashboard/overview', 
      icon: Home, 
      label: 'Home',
      roles: ['Landlord', 'Agent', 'Super Admin', 'Super Moderator']
    },
    { 
      path: '/dashboard/properties', 
      icon: Building2, 
      label: 'Properties',
      roles: ['Landlord', 'Agent']
    },
    { 
      path: '/dashboard/overview', 
      icon: Home, 
      label: 'Overview',
      isHighlighted: true,
      roles: ['Landlord', 'Agent', 'Super Admin', 'Super Moderator', 'Tenant']
    },
    { 
      path: '/dashboard/tenants', 
      icon: Users, 
      label: 'Tenants',
      roles: ['Landlord', 'Agent']
    },
    { 
      path: 'more', 
      icon: MoreHorizontal, 
      label: 'More',
      action: () => setShowMore(true),
      roles: ['Landlord', 'Agent', 'Super Admin', 'Super Moderator', 'Tenant']
    },
  ];

  const moreItems = [
    { path: '/dashboard/payments', icon: CreditCard, label: 'Payments', roles: ['Landlord', 'Agent'] },
    { path: '/dashboard/expenses', icon: CreditCard, label: 'Expenses', roles: ['Landlord', 'Agent'] },
    { path: '/dashboard/maintenance', icon: Building2, label: 'Maintenance', roles: ['Landlord', 'Agent'] },
    { path: '/dashboard/cashflow', icon: CreditCard, label: 'Cash Flow', roles: ['Landlord', 'Agent'] },
    { path: '/dashboard/billing', icon: CreditCard, label: 'Billing', roles: ['Landlord', 'Agent'] },
    { path: '/dashboard/settings', icon: Building2, label: 'Settings', roles: ['Landlord', 'Agent', 'Tenant'] },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard/overview') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/overview';
    }
    return location.pathname.startsWith(path);
  };

  const canAccess = (roles: string[]) => {
    return user?.role && roles.includes(user.role);
  };

  const filteredMainNav = mainNavItems.filter(item => canAccess(item.roles));
  const filteredMoreItems = moreItems.filter(item => canAccess(item.roles));

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 app-surface border-t border-app-border">
        <div className="grid grid-cols-5 h-20">
          {filteredMainNav.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            
            if (item.action) {
              return (
                <button
                  key={item.path}
                  onClick={item.action}
                  className="flex flex-col items-center justify-center text-text-secondary hover:text-text-primary transition-colors duration-300"
                >
                  <IconComponent size={20} />
                  <span className="text-xs font-medium mt-1">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center transition-all duration-300 ${
                  item.isHighlighted && active
                    ? 'app-gradient text-white rounded-t-3xl mx-2 mt-2 shadow-app-lg'
                    : active
                    ? 'text-brand-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <IconComponent size={20} />
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* More Menu Slide Over */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 app-surface rounded-t-3xl border-t border-app-border"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary">More Options</h3>
                  <button
                    onClick={() => setShowMore(false)}
                    className="p-2 rounded-full text-text-secondary hover:text-text-primary"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {filteredMoreItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setShowMore(false)}
                        className="flex flex-col items-center p-4 rounded-2xl app-surface border border-app-border hover:shadow-app transition-all duration-300"
                      >
                        <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center mb-2">
                          <IconComponent size={20} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-text-primary text-center">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomNavBar;
