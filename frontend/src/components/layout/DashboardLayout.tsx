import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

// Icons
const HomeIcon = () => <span>🏠</span>;
const PropertiesIcon = () => <span>🏢</span>;
const TenantsIcon = () => <span>👥</span>;
const PaymentsIcon = () => <span>💳</span>;
const SettingsIcon = () => <span>⚙️</span>;
const LogoutIcon = () => <span>➡️</span>;
const AdminIcon = () => <span>⭐</span>;
const AuditIcon = () => <span>🛡️</span>;

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <div className="bg-slate-900 h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  const getLinkClass = (path: string) => {
    return location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))
      ? 'bg-blue-600 text-white'
      : 'text-slate-300 hover:bg-slate-700 hover:text-white';
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-slate-800 shadow-2xl flex flex-col">
        <div className="h-20 flex items-center justify-center border-b border-slate-700">
          <Link to="/dashboard" className="text-xl font-bold text-white">HNV Dashboard</Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/dashboard" className={`flex items-center space-x-3 px-4 py-2.5 font-semibold rounded-lg transition-colors ${getLinkClass('/dashboard')}`}>
            <HomeIcon /><span>Overview</span>
          </Link>
          <Link to="/dashboard/properties" className={`flex items-center space-x-3 px-4 py-2.5 font-semibold rounded-lg transition-colors ${getLinkClass('/dashboard/properties')}`}>
            <PropertiesIcon /><span>Properties</span>
          </Link>
           <Link to="/tenants" className={`flex items-center space-x-3 px-4 py-2.5 font-semibold rounded-lg transition-colors ${getLinkClass('/tenants')}`}>
            <TenantsIcon /><span>Tenants</span>
          </Link>
           <Link to="/billing" className={`flex items-center space-x-3 px-4 py-2.5 font-semibold rounded-lg transition-colors ${getLinkClass('/billing')}`}>
            <PaymentsIcon /><span>Billing</span>
          </Link>
           <Link to="/audit-log" className={`flex items-center space-x-3 px-4 py-2.5 font-semibold rounded-lg transition-colors ${getLinkClass('/audit-log')}`}>
            <AuditIcon /><span>Audit Log</span>
          </Link>
          
          {user.role === 'Super Admin' && (
            <div className="pt-4 mt-4 border-t border-slate-700">
              <h3 className="px-4 text-xs font-semibold uppercase text-slate-500 mb-2">Admin Panel</h3>
              <Link to="/admin/dashboard" className={`flex items-center space-x-3 px-4 py-2.5 font-semibold rounded-lg transition-colors ${getLinkClass('/admin/dashboard')}`}>
                <AdminIcon /><span>Super Admin</span>
              </Link>
            </div>
          )}
        </nav>
        <div className="p-4 border-t border-slate-700">
           <Link to="/profile" className={`flex items-center space-x-3 px-4 py-2.5 font-semibold rounded-lg transition-colors ${getLinkClass('/profile')}`}>
            <SettingsIcon /><span>Profile & Settings</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 mt-2 font-semibold rounded-lg text-slate-300 hover:bg-red-800/50 hover:text-white">
            <LogoutIcon /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-slate-900">
        <header className="h-20 bg-slate-800/50 backdrop-blur-md border-b border-slate-700 flex items-center justify-end px-8">
            <div className="text-right">
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-sm text-slate-400">{user.role}</p>
            </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
