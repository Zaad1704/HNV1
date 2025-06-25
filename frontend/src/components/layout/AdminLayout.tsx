import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import AdminSidebar from '../admin/AdminSidebar';

const AdminLayout = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <div className="bg-light-bg dark:bg-dark-bg h-screen flex items-center justify-center text-dark-text dark:text-dark-text-dark transition-colors duration-300">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      {/* Admin Sidebar - Hidden on mobile, flex on md and up */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-light-card dark:bg-dark-card text-dark-text dark:text-dark-text-dark flex-col border-r border-border-color dark:border-border-color-dark transition-colors duration-300">
        <AdminSidebar />
      </aside>
      
      <main className="flex-1 flex flex-col bg-light-bg dark:bg-dark-bg">
        <header className="h-20 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-border-color dark:border-border-color-dark flex-shrink-0 flex items-center justify-end px-4 sm:px-8 shadow-sm transition-all duration-200">
            <div className="text-right">
                <p className="font-semibold text-dark-text dark:text-dark-text-dark">{user.name}</p>
                <p className="text-sm text-light-text dark:text-light-text-dark">{user.role}</p>
            </div>
        </header>
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto pb-24 md:pb-8"> {/* Added responsive padding-bottom */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
