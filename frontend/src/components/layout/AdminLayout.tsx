import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import AdminSidebar from '../admin/AdminSidebar'; // We will use the existing AdminSidebar

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <div className="bg-slate-100 h-screen flex items-center justify-center text-gray-800">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation from your existing component */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-end px-8">
            <div className="text-right">
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.role}</p>
            </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          {/* This is where the specific admin page content will be rendered */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
