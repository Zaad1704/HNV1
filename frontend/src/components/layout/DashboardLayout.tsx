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
    const base = 'flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors';
    if (location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))) {
      return `${base} bg-yellow-500 text-slate-900`;
    }
    return `${base} text-slate-300 hover:bg-slate-700 hover:text-white`;
  };

  const brandName = user?.organizationId?.branding?.companyName || "HNV Dashboard";
  const brandLogo = user?.organizationId?.branding?.companyLogoUrl || "https://placehold.co/32x32/f59e0b/0f172a?text=H";

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
      <Link to="/dashboard/maintenance" className={getLinkClass('/dashboard/maintenance')}>
        <Wrench size={20} /><span>{t('dashboard.nav.maintenance')}</span>
      </Link>
      <Link to="/dashboard/billing" className={getLinkClass('/dashboard/billing')}>
        <CreditCard size={20} /><span>{t('dashboard.nav.billing')}</span>
      </Link>
      <Link to="/dashboard/users" className={getLinkClass('/dashboard/users')}>
        <Users size={20} /><span>{t('dashboard.nav.users')}</span>
      </Link>
      <Link to="/dashboard/audit-log" className={getLinkClass('/dashboard/audit-log')}>
        <Shield size={20} /><span>{t('dashboard.nav.audit_log')}</span>
      </Link>
      
      {user?.role === 'Super Admin' && (
        <div className="pt-4 mt-4 border-t border-slate-700">
          <h3 className="px-4 text-xs font-semibold uppercase text-slate-500 mb-2">Admin Panel</h3>
          <Link to="/admin" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg ${location.pathname.startsWith('/admin') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
            <Star size={20} /><span>{t('dashboard.nav.admin_panel')}</span>
          </Link>
        </div>
      )}
    </>
  );

  const SidebarContent = () => (
    <>
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-700">
            <Link to="/dashboard" className="text-xl font-bold text-white flex items-center space-x-2 overflow-hidden">
               <img src={brandLogo} alt="Brand Logo" className="h-8 w-8 rounded-md flex-shrink-0 object-contain" />
               <span className="truncate">{brandName}</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-300 hover:text-white md:hidden"><X size={24} /></button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto"><NavLinks /></nav>
        <div className="p-4 border-t border-slate-700">
            <Link to="/dashboard/settings" className={getLinkClass('/dashboard/settings')}>
                <Settings size={20} /><span>{t('dashboard.nav.settings')}</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 mt-2 font-bold rounded-lg text-slate-300 hover:bg-red-800/50 hover:text-white">
                <LogOut size={20} /><span>{t('dashboard.nav.logout')}</span>
            </button>
        </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-900">
        <aside className="w-64 flex-shrink-0 bg-slate-800 shadow-2xl flex-col hidden md:flex">
            <SidebarContent />
        </aside>

        <div className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)}></div>
            <aside className={`absolute top-0 left-0 h-full w-64 bg-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>
        </div>
        
        <main className="flex-1 flex flex-col">
            <header className="h-20 bg-slate-800/50 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-4 sm:px-8">
                <button className="text-slate-300 hover:text-white md:hidden" onClick={() => setSidebarOpen(true)}>
                    <Menu size={24}/>
                </button>
                <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right">
                        <p className="font-semibold text-white">{user?.name}</p>
                        <p className="text-sm text-slate-400">{user?.role}</p>
                    </div>
                </div>
            </header>
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
              <Outlet />
            </div>
        </main>
    </div>
  );
};

export default DashboardLayout;
