import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import AdminSidebar from '../admin/AdminSidebar';

const AdminLayout = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <div className="bg-light-bg h-screen flex items-center justify-center text-dark-text">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-light-bg">
      <AdminSidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-light-card/80 backdrop-blur-lg border-b border-border-color flex-shrink-0 flex items-center justify-end px-8">
            <div className="text-right">
                <p className="font-semibold text-dark-text">{user.name}</p>
                <p className="text-sm text-light-text">{user.role}</p>
            </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
