import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Home, Building, Users, CreditCard, Shield, Settings, LogOut, Star, Menu, X } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinkClass = (path: string) => {
    return location.pathname.startsWith(path) && path !== '/dashboard' || location.pathname === path
      ? 'bg-yellow-500 text-slate-900'
      : 'text-slate-300 hover:bg-slate-700 hover:text-white';
  };

  const NavLinks = () => (
    <>
      <Link to="/dashboard" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard')}`}>
        <Home size={20} /><span>Overview</span>
      </Link>
      <Link to="/dashboard/organization" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/organization')}`}>
        <Building size={20} /><span>My Organization</span>
      </Link>
      <Link to="/dashboard/users" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/users')}`}>
        <Users size={20} /><span>Users & Invites</span>
      </Link>
      <Link to="/dashboard/billing" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/billing')}`}>
        <CreditCard size={20} /><span>Billing</span>
      </Link>
      <Link to="/dashboard/audit-log" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/audit-log')}`}>
        <Shield size={20} /><span>Audit Log</span>
      </Link>
      {user?.role === 'Super Admin' && (
        <div className="pt-4 mt-4 border-t border-slate-700">
          <h3 className="px-4 text-xs font-semibold uppercase text-slate-500 mb-2">Admin Panel</h3>
          <Link to="/admin/dashboard" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${location.pathname.startsWith('/admin') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
            <Star size={20} /><span>Super Admin</span>
          </Link>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar for Desktop */}
      <aside className="w-64 flex-shrink-0 bg-slate-800 shadow-2xl flex-col hidden md:flex">
        <div className="h-20 flex items-center justify-center border-b border-slate-700">
          <Link to="/dashboard" className="text-xl font-bold text-white flex items-center space-x-2">
            <img src="https://placehold.co/32x32/f59e0b/0f172a?text=HNV" alt="HNV Logo" className="h-8 w-8 rounded-md" />
            <span>HNV Dashboard</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2"><NavLinks /></nav>
        <div className="p-4 border-t border-slate-700">
           <Link to="/dashboard/settings" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/settings')}`}>
            <Settings size={20} /><span>Profile & Settings</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 mt-2 font-bold rounded-lg text-slate-300 hover:bg-red-800/50 hover:text-white">
            <LogOut size={20} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Overlay) */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)}></div>
        <aside className={`absolute top-0 left-0 h-full w-64 bg-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <div className="h-20 flex items-center justify-between px-4 border-b border-slate-700">
             <Link to="/dashboard" className="text-xl font-bold text-white">HNV Dashboard</Link>
             <button onClick={() => setSidebarOpen(false)} className="text-slate-300 hover:text-white"><X size={24} /></button>
           </div>
           <nav className="flex-1 px-4 py-6 space-y-2"><NavLinks /></nav>
           <div className="p-4 border-t border-slate-700">
            <Link to="/dashboard/settings" className={`flex items-center space-x-3 px-4 py-2.5 font-bold rounded-lg transition-colors ${getLinkClass('/dashboard/settings')}`}>
                <Settings size={20} /><span>Profile & Settings</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 mt-2 font-bold rounded-lg text-slate-300 hover:bg-red-800/50 hover:text-white">
                <LogOut size={20} /><span>Logout</span>
            </button>
           </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-slate-800/50 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-4 sm:px-8">
            <button className="text-slate-300 hover:text-white md:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu size={24}/>
            </button>
            <div className="text-right ml-auto">
                <p className="font-semibold text-white">{user?.name}</p>
                <p className="text-sm text-slate-400">{user?.role}</p>
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
