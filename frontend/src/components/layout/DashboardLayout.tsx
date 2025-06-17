import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { Home, Building, Users, CreditCard, Shield, Settings, LogOut, Star, Menu, X, FileText } from 'lucide-react'; // <-- Import FileText icon

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
    return location.pathname.startsWith(path)
      ? 'bg-yellow-500 text-slate-900'
      : 'text-slate-300 hover:bg-slate-700 hover:text-white';
  };

  const NavLinks = () => (
    <>
      <Link to="/dashboard/overview" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/overview')}`}>
        <Home size={20} /><span>{t('dashboard.nav.overview')}</span>
      </Link>
      <Link to="/dashboard/properties" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/properties')}`}>
        <Building size={20} /><span>{t('dashboard.nav.properties')}</span>
      </Link>
      <Link to="/dashboard/tenants" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/tenants')}`}>
        <Users size={20} /><span>{t('dashboard.nav.tenants')}</span>
      </Link>
      
      {/* --- NEW LINK for EXPENSES --- */}
      <Link to="/dashboard/expenses" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/expenses')}`}>
        <FileText size={20} /><span>{t('dashboard.nav.expenses')}</span>
      </Link>

      <Link to="/dashboard/billing" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/billing')}`}>
        <CreditCard size={20} /><span>{t('dashboard.nav.billing')}</span>
      </Link>
      <Link to="/dashboard/users" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/users')}`}>
        <Users size={20} /><span>{t('dashboard.nav.users')}</span>
      </Link>
      <Link to="/dashboard/audit-log" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/audit-log')}`}>
        <Shield size={20} /><span>{t('dashboard.nav.audit_log')}</span>
      </Link>
      {user?.role === 'Super Admin' && (
        <div className="pt-4 mt-4 border-t border-slate-700">
          <h3 className="px-4 text-xs font-semibold uppercase text-slate-500 mb-2">Admin Panel</h3>
          <Link to="/admin/dashboard" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${location.pathname.startsWith('/admin') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
            <Star size={20} /><span>{t('dashboard.nav.admin_panel')}</span>
          </Link>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-slate-900">
      <aside className="w-64 flex-shrink-0 bg-slate-800 shadow-2xl flex-col hidden md:flex">
        {/* ... Sidebar Header ... */}
        <nav className="flex-1 px-4 py-6 space-y-2"><NavLinks /></nav>
        <div className="p-4 border-t border-slate-700">
           <Link to="/dashboard/settings" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/settings')}`}>
            <Settings size={20} /><span>{t('dashboard.nav.settings')}</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 mt-2 font-bold rounded-lg text-slate-300 hover:bg-red-800/50 hover:text-white">
            <LogOut size={20} /><span>{t('dashboard.nav.logout')}</span>
          </button>
        </div>
      </aside>
      
      {/* ... Mobile Sidebar ... */}

      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-slate-800/50 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-4 sm:px-8">
            <button className="text-slate-300 hover:text-white md:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu size={24}/>
            </button>
            <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center space-x-1 bg-slate-700/50 border border-slate-600 rounded-full p-1">
                    <button onClick={() => i18n.changeLanguage('en')} className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${i18n.language === 'en' ? 'bg-yellow-500 text-slate-900' : 'text-slate-300'}`}>EN</button>
                    <button onClick={() => i18n.changeLanguage('bn')} className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${i18n.language === 'bn' ? 'bg-yellow-500 text-slate-900' : 'text-slate-300'}`}>BN</button>
                </div>
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
