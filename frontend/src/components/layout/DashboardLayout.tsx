import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
    Home, Building, Users, CreditCard, Shield, Settings, 
    LogOut, Star, Menu, X, FileText, Wrench 
} from 'lucide-react';
import NotificationsPanel from '../dashboard/NotificationsPanel';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinkClass = (path) => {
    const base = 'flex items-center space-x-3 px-4 py-2.5 font-semibold rounded-lg transition-colors';
    const isActive = location.pathname.startsWith(path);
    if (isActive) {
      return `${base} bg-brand-primary/20 text-white`;
    }
    return `${base} text-indigo-200 hover:bg-brand-primary/10 hover:text-white`;
  };

  const brandName = user?.organizationId?.branding?.companyName || "HNV Dashboard";
  const brandLogo = "/logo-min.png";

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
        <Link to="/dashboard" className="text-xl font-bold text-white flex items-center space-x-3 overflow-hidden">
           <img src={brandLogo} alt="Brand Logo" className="h-8 w-8 rounded-md flex-shrink-0 object-contain" />
           <span className="truncate">{brandName}</span>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="text-indigo-200 hover:text-white md:hidden"><X size={24} /></button>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <Link to="/dashboard/overview" className={getLinkClass('/dashboard/overview')}><Home size={20} /><span>Overview</span></Link>
        <Link to="/dashboard/properties" className={getLinkClass('/dashboard/properties')}><Building size={20} /><span>Properties</span></Link>
        <Link to="/dashboard/tenants" className={getLinkClass('/dashboard/tenants')}><Users size={20} /><span>Tenants</span></Link>
        <Link to="/dashboard/expenses" className={getLinkClass('/dashboard/expenses')}><FileText size={20} /><span>Expenses</span></Link>
        <Link to="/dashboard/maintenance" className={getLinkClass('/dashboard/maintenance')}><Wrench size={20} /><span>Maintenance</span></Link>
        <Link to="/dashboard/billing" className={getLinkClass('/dashboard/billing')}><CreditCard size={20} /><span>Billing</span></Link>
        <Link to="/dashboard/audit-log" className={getLinkClass('/dashboard/audit-log')}><Shield size={20} /><span>Audit Log</span></Link>
      </nav>
      <div className="p-4 border-t border-white/10">
        <Link to="/dashboard/settings" className={getLinkClass('/dashboard/settings')}><Settings size={20} /><span>Settings</span></Link>
        <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 mt-1 font-semibold rounded-lg text-indigo-200 hover:bg-red-800/20 hover:text-white">
          <LogOut size={20} /><span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-brand-bg">
      <aside className="w-64 flex-shrink-0 bg-brand-dark flex-col hidden md:flex">
        <SidebarContent />
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-light-card border-b border-border-color flex-shrink-0 flex items-center justify-between px-4 sm:px-8">
            <button className="text-light-text hover:text-dark-text md:hidden" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24}/>
            </button>
            <div className="flex items-center gap-6 ml-auto">
                <NotificationsPanel />
                <div className="h-8 border-l border-border-color"></div>
                <div className="text-right">
                    <p className="font-semibold text-dark-text">{user?.name}</p>
                    <p className="text-sm text-light-text">{user?.role}</p>
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
