// frontend/src/components/layout/DashboardLayout.tsx
import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { Home, Building, Users, CreditCard, Shield, Settings, LogOut, Star, Menu, X, FileText, Wrench } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinkClass = (path: string) => {
    return location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))
      ? 'bg-yellow-500 text-slate-900'
      : 'text-slate-300 hover:bg-slate-700 hover:text-white';
  };

  const brandName = user?.organizationId?.branding?.companyName || "HNV Dashboard";
  const brandLogo = user?.organizationId?.branding?.companyLogoUrl || "https://placehold.co/32x32/f59e0b/0f172a?text=HNV";

  const NavLinks = () => (
    <>
      <Link to="/dashboard/overview" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg ${getLinkClass('/dashboard/overview')}`}>
        <Home size={20} /><span>{t('dashboard.nav.overview')}</span>
      </Link>
      <Link to="/dashboard/properties" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg ${getLinkClass('/dashboard/properties')}`}>
        <Building size={20} /><span>{t('dashboard.nav.properties')}</span>
      </Link>
      {/* ... Add all other nav links here in the same format ... */}
      <Link to="/dashboard/users" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg ${getLinkClass('/dashboard/users')}`}>
        <Users size={20} /><span>{t('dashboard.nav.users')}</span>
      </Link>
      {user?.role === 'Super Admin' && (
        <div className="pt-4 mt-4 border-t border-slate-700">
          <Link to="/admin" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg ${getLinkClass('/admin')}`}>
            <Star size={20} /><span>{t('dashboard.nav.admin_panel')}</span>
          </Link>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-slate-900">
        {/* --- Desktop & Mobile Sidebar JSX here... (no changes needed) --- */}
        
        <main className="flex-1 flex flex-col">
            <header className="h-20 bg-slate-800/50 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-4 sm:px-8">
                {/* ... Header JSX remains the same ... */}
            </header>
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
              {/* This Outlet now renders the specific dashboard page from App.tsx */}
              <Outlet />
            </div>
        </main>
    </div>
  );
};

export default DashboardLayout;
