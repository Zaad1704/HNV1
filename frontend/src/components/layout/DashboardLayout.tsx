// frontend/src/components/layout/DashboardLayout.tsx

import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import {
    Home, Building, Users, CreditCard, Shield, Settings,
    LogOut, Star, Menu, X, FileText, Wrench
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinkClass = (path) => {
    const base = 'flex items-center space-x-3 px-4 py-2.5 font-semibold rounded-lg transition-colors';
    const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
    if (isActive) {
      return `${base} bg-brand-orange text-white shadow-sm`;
    }
    return `${base} text-light-text hover:bg-gray-100 hover:text-dark-text`;
  };
  
  const getBottomNavLinkClass = (path) => {
    const base = 'flex flex-col items-center justify-center gap-1 w-full h-full transition-colors';
    const isActive = location.pathname.startsWith(path);
    return isActive ? `${base} text-brand-orange` : `${base} text-light-text hover:bg-gray-100`;
  }

  const brandName = user?.organizationId?.branding?.companyName || "HNV Dashboard";
  const brandLogo = user?.organizationId?.branding?.companyLogoUrl || "https://placehold.co/32x32/FF7A00/FFFFFF?text=H";

  const NavLinks = () => (
    <>
      <Link to="/dashboard/overview" className={getLinkClass('/dashboard/overview')}>
        <Home size={20} /><span>{t('dashboard.nav.overview')}</span>
      </Link>
      <Link to="/dashboard/properties" className={getLinkClass('/dashboard/properties')}>
        <Building size={20} /><span>{t('dashboard.nav.properties')}</span>
      </Link>
       <Link to="/dashboard/tenants" className={getLinkClass('/dashboard/tenants')}>
        <Users size={20} /><span>{t('dashboard.nav.tenants')}</span>
      </Link>
      <Link to="/dashboard/expenses" className={getLinkClass('/dashboard/expenses')}>
        <FileText size={20} /><span>{t('dashboard.nav.expenses')}</span>
      </Link>
      {/* ... other links remain the same ... */}
    </>
  );

  const SidebarContent = () => (
    <>
        <div className="h-20 flex items-center justify-between px-4 border-b border-border-color">
            <Link to="/dashboard" className="text-xl font-bold text-dark-text flex items-center space-x-2 overflow-hidden">
               <img src={brandLogo} alt="Brand Logo" className="h-8 w-8 rounded-md flex-shrink-0 object-contain" />
               <span className="truncate">{brandName}</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="text-light-text hover:text-dark-text md:hidden"><X size={24} /></button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto"><NavLinks /></nav>
        <div className="p-4 border-t border-border-color">
            <Link to="/dashboard/settings" className={getLinkClass('/dashboard/settings')}>
                <Settings size={20} /><span>{t('dashboard.nav.settings')}</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 mt-2 font-semibold rounded-lg text-light-text hover:bg-red-50 hover:text-red-600">
                <LogOut size={20} /><span>{t('dashboard.nav.logout')}</span>
            </button>
        </div>
    </>
  );

  return (
    <div className="flex h-screen bg-light-bg">
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="w-64 flex-shrink-0 bg-light-card shadow-md flex-col hidden md:flex">
            <SidebarContent />
        </aside>

        {/* --- MOBILE SIDEBAR (off-canvas) --- */}
        <div className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)}></div>
            <aside className={`absolute top-0 left-0 h-full w-64 bg-light-card shadow-xl flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>
        </div>
        
        <main className="flex-1 flex flex-col overflow-hidden">
            <header className="h-20 bg-light-card/80 backdrop-blur-lg border-b border-border-color flex-shrink-0 flex items-center justify-between px-4 sm:px-8">
                <button className="text-dark-text hover:text-brand-orange md:hidden" onClick={() => setSidebarOpen(true)}>
                    <Menu size={24}/>
                </button>
                <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right">
                        <p className="font-semibold text-dark-text">{user?.name}</p>
                        <p className="text-sm text-light-text">{user?.role}</p>
                    </div>
                </div>
            </header>
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto pb-24 md:pb-8"> {/* Add padding-bottom for mobile nav */}
              <Outlet />
            </div>
        </main>
        
        {/* --- MOBILE BOTTOM NAVIGATION --- */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-card border-t border-border-color shadow-[0_-2px_5px_rgba(0,0,0,0.05)] flex justify-around items-center">
            <Link to="/dashboard/overview" className={getBottomNavLinkClass('/dashboard/overview')}>
                <Home size={22} />
                <span className="text-xs font-medium">Home</span>
            </Link>
            <Link to="/dashboard/properties" className={getBottomNavLinkClass('/dashboard/properties')}>
                <Building size={22} />
                <span className="text-xs font-medium">Properties</span>
            </Link>
            <Link to="/dashboard/tenants" className={getBottomNavLinkClass('/dashboard/tenants')}>
                <Users size={22} />
                <span className="text-xs font-medium">Tenants</span>
            </Link>
            <Link to="/dashboard/settings" className={getBottomNavLinkClass('/dashboard/settings')}>
                <Settings size={22} />
                <span className="text-xs font-medium">Settings</span>
            </Link>
        </nav>
    </div>
  );
};

export default DashboardLayout;
