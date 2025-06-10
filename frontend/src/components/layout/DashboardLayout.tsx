import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

// Placeholder icons
const HomeIcon = () => <span>🏠</span>;
const PropertiesIcon = () => <span>🏢</span>;
const TenantsIcon = () => <span>👥</span>;
const PaymentsIcon = () => <span>💳</span>;
const SettingsIcon = () => <span>⚙️</span>;
const LogoutIcon = () => <span>➡️</span>;
const AdminIcon = () => <span>⭐</span>;
const AuditIcon = () => <span>🛡️</span>;

const DashboardLayout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    // This is important for when the page first loads
    // and the user state is being restored from storage.
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-white shadow-lg flex flex-col">
        <div className="h-20 flex items-center justify-center border-b">
          <Link to="/dashboard" className="text-2xl font-bold text-indigo-700">HNV Dashboard</Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-700">
            <HomeIcon /><span>Overview</span>
          </Link>
          <Link to="/dashboard/properties" className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-700">
            <PropertiesIcon /><span>Properties</span>
          </Link>
          <Link to="/dashboard/tenants" className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-700">
            <TenantsIcon /><span>Tenants</span>
          </Link>
          <Link to="/dashboard/payments" className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-700">
            <PaymentsIcon /><span>Payments</span>
          </Link>
          <Link to="/dashboard/audit-log" className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-700">
            <AuditIcon /><span>Audit Log</span>
          </Link>
          
          {/* Super Admin Conditional Links */}
          {user.role === 'Super Admin' && (
            <div className="pt-4 mt-4 border-t">
              <h3 className="px-4 text-xs font-semibold uppercase text-gray-400 mb-2">Admin Panel</h3>
              <Link to="/dashboard/site-editor" className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-700">
                <AdminIcon /><span>Site Content</span>
              </Link>
            </div>
          )}
        </nav>
        <div className="p-4 border-t">
           <Link to="/dashboard/settings" className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-700">
            <SettingsIcon /><span>Settings</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 mt-2 text-gray-700 font-semibold rounded-lg hover:bg-red-50 hover:text-red-700">
            <LogoutIcon /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b flex items-center justify-end px-8">
            <div className="text-right">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.role}</p>
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
