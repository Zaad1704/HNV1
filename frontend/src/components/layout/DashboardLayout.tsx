import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import GlobalLanguageSwitcher from '../common/GlobalLanguageSwitcher';
import LocalLanguageToggle from '../common/LocalLanguageToggle';
import LanguageDropdown from '../LanguageDropdown';
import { 
  Home, Building, Users, CreditCard, Shield, Settings, LogOut, 
  Wrench, FileText, DollarSign, Repeat, CheckSquare, Bell, 
  Globe, Sun, Moon, Menu, X, Brain 
} from 'lucide-react';
import RoleGuard from '../RoleGuard';
import BottomNavBar from './BottomNavBar';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import NotificationsPanel from '../dashboard/NotificationsPanel';
import RealTimeNotifications from '../dashboard/RealTimeNotifications';
import EmailVerificationWarning from '../dashboard/EmailVerificationWarning';
import LiveChatWidget from '../chat/LiveChatWidget';
import { AnimatePresence, motion } from 'framer-motion';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { lang, setLang, getNextToggleLanguage } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getLinkClass = (path: string) => {
    const base = 'flex items-center space-x-3 px-4 py-3 font-medium rounded-2xl transition-all duration-300';
    const isActive = path === '/dashboard/overview' 
      ? (location.pathname === '/dashboard' || location.pathname === '/dashboard/overview')
      : location.pathname.startsWith(path);
    return isActive 
      ? `${base} app-gradient text-white shadow-app` 
      : `${base} text-text-secondary hover:text-text-primary hover:bg-app-surface`;
  };

  const mainNavLinks = [
    { href: "/dashboard/overview", icon: Brain, label: 'Smart Dashboard', roles: ['Landlord', 'Agent', 'Super Admin', 'Super Moderator'] },
    { href: "/dashboard/tenant", icon: Home, label: t('dashboard.tenant_portal'), roles: ['Tenant'] },
    { href: "/dashboard/properties", icon: Building, label: t('dashboard.properties'), roles: ['Landlord', 'Agent'] },
    { href: "/dashboard/tenants", icon: Users, label: t('dashboard.tenants'), roles: ['Landlord', 'Agent'] },
    { href: "/dashboard/payments", icon: CreditCard, label: t('dashboard.payments'), roles: ['Landlord', 'Agent'] },
    { href: "/dashboard/expenses", icon: DollarSign, label: t('dashboard.expenses'), roles: ['Landlord', 'Agent'] },
    { href: "/dashboard/maintenance", icon: Wrench, label: t('dashboard.maintenance'), roles: ['Landlord', 'Agent'] },
    { href: "/dashboard/cashflow", icon: DollarSign, label: t('dashboard.cash_flow'), roles: ['Landlord', 'Agent'] },
    { href: "/dashboard/reminders", icon: Repeat, label: t('dashboard.reminders'), roles: ['Landlord', 'Agent'] },
    { href: "/dashboard/approvals", icon: CheckSquare, label: t('dashboard.approvals'), roles: ['Landlord', 'Agent'] },
    { href: "/dashboard/users", icon: Users, label: t('dashboard.users_invites'), roles: ['Landlord', 'Agent'] },
    { href: "/dashboard/billing", icon: CreditCard, label: t('dashboard.billing'), roles: ['Landlord', 'Agent'] },
    { href: "/dashboard/audit-log", icon: FileText, label: t('dashboard.audit_log'), roles: ['Landlord', 'Agent'] },
  ];
  
  const adminLink = { href: "/admin", icon: Shield, label: t('dashboard.admin_panel'), roles: ['Super Admin', 'Super Moderator'] };

  const Sidebar = ({ isMobile = false }) => (
    <aside className={`${isMobile ? 'w-full max-w-sm' : 'w-72 xl:w-80'} flex-shrink-0 app-surface border-r border-app-border flex flex-col h-full`}>
      <div className="h-20 flex items-center justify-between px-6 border-b border-app-border">
        <Link to="/dashboard" className="flex items-center space-x-3 text-xl font-bold text-text-primary">
          <div className="w-10 h-10 app-gradient rounded-xl flex items-center justify-center">
            <Building size={20} className="text-white" />
          </div>
          <span className="truncate">
            {t('app_name_short')}
          </span>
        </Link>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-full text-text-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {mainNavLinks.map(link => (
          <RoleGuard key={link.href} allowed={link.roles}>
            <Link 
              to={link.href} 
              className={getLinkClass(link.href)}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </Link>
          </RoleGuard>
        ))}
        <RoleGuard allowed={adminLink.roles}>
          <hr className="my-4 border-app-border" />
          <Link 
            to={adminLink.href} 
            className={getLinkClass(adminLink.href)}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <adminLink.icon size={20} />
            <span>{adminLink.label}</span>
          </Link>
        </RoleGuard>
      </nav>
      
      <div className="p-4 border-t border-app-border space-y-2">
        <Link 
          to="/dashboard/settings" 
          className={getLinkClass('/dashboard/settings')}
          onClick={() => isMobile && setSidebarOpen(false)}
        >
          <Settings size={20} />
          <span>{t('dashboard.settings')}</span>
        </Link>
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center space-x-3 px-4 py-3 font-medium rounded-2xl text-text-secondary hover:text-text-primary hover:bg-app-surface transition-all duration-300"
        >
          <LogOut size={20} />
          <span>{t('dashboard.logout')}</span>
        </button>
      </div>
    </aside>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-app-bg">
        <MobileHeader onMenuToggle={() => setSidebarOpen(true)} showNotifications={true} />
        
        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-80"
              >
                <Sidebar isMobile />
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        <main className="pt-16 pb-20 mobile-content scroll-container">
          <EmailVerificationWarning />
          <div className="max-w-7xl mx-auto px-4">
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </div>
        </main>
        
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-app-bg">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
            >
              <Sidebar isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 app-surface/95 backdrop-blur-md border-b border-app-border flex-shrink-0 flex items-center justify-between px-4 lg:px-8 shadow-app relative z-[100]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden touch-target p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-app-bg transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-text-primary hidden lg:block">
              {t('nav.dashboard')}
            </h1>
          </div>

          {/* Center: Company Name - Always visible */}
          <div className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 max-w-xs lg:max-w-sm z-[90]">
            <span className="text-base lg:text-lg font-bold text-text-primary text-center truncate">
              {t('app_name')}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 relative z-[110] ml-auto">
            {/* Language Controls - Grouped */}
            <div className="flex items-center gap-1 bg-app-surface/50 rounded-lg p-1">
              <div className="relative">
                <LocalLanguageToggle />
              </div>
              <div className="relative">
                <LanguageDropdown />
              </div>
            </div>
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="touch-target p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-app-surface transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            
            {/* Notifications - Grouped */}
            <div className="flex items-center gap-1 bg-app-surface/50 rounded-lg p-1">
              <RealTimeNotifications />
              <NotificationsPanel />
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-2 bg-app-surface/50 rounded-lg p-1 pl-2">
              <div className="w-8 h-8 app-gradient rounded-full flex items-center justify-center font-semibold text-white text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block pr-1">
                <p className="font-medium text-text-primary text-sm leading-tight">{user?.name}</p>
                <p className="text-xs text-text-secondary leading-tight">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-4 lg:pb-8 scroll-container">
          <EmailVerificationWarning />
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </div>
        </div>
      </main>

      <LiveChatWidget />
      <BottomNavBar />
    </div>
  );
};

export default DashboardLayout;