// frontend/src/components/layout/DashboardLayout.tsx

import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
    Home, Building, Users, CreditCard, Shield, Settings, 
    LogOut, Star, Menu, X, FileText, Wrench, BarChart2, Bell, MessageSquare, Briefcase, DollarSign
} from 'lucide-react'; // Added DollarSign for cash flow
import NotificationsPanel from '../components/dashboard/NotificationsPanel';
import BottomNavBar from './BottomNavBar';
import RoleGuard from '../RoleGuard';

const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const DesktopSidebar = () => {
        const getLinkClass = (path) => {
            const base = 'flex items-center space-x-3 px-4 py-2.5 font-semibold rounded-lg transition-colors';
            const isActive = location.pathname.startsWith(path);
            return isActive ? `${base} bg-brand-primary/20 text-white` : `${base} text-indigo-200 hover:bg-brand-primary/10 hover:text-white`;
        };

        return (
            <aside className="w-64 flex-shrink-0 bg-brand-dark flex-col hidden md:flex">
                <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
                    <Link to="/dashboard" className="text-xl font-bold text-white flex items-center space-x-3 overflow-hidden">
                       <img src="/logo-min.png" alt="Brand Logo" className="h-8 w-8 rounded-md flex-shrink-0 object-contain" />
                       <span className="truncate">{user?.organizationId?.branding?.companyName || 'HNV Dashboard'}</span>
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <Link to="/dashboard/overview" className={getLinkClass('/dashboard/overview')}><Home size={20} /><span>Overview</span></Link>
                    
                    {/* Role-specific link for Tenants */}
                    <RoleGuard allowed={['Tenant']}>
                        <Link to="/dashboard/tenant" className={getLinkClass('/dashboard/tenant')}><Users size={20} /><span>My Tenant Portal</span></Link>
                    </RoleGuard>

                    {/* Links for Landlords and Agents */}
                    <RoleGuard allowed={['Landlord', 'Agent']}>
                        <Link to="/dashboard/properties" className={getLinkClass('/dashboard/properties')}><Building size={20} /><span>Properties</span></Link>
                        <Link to="/dashboard/tenants" className={getLinkClass('/dashboard/tenants')}><Users size={20} /><span>Tenants</span></Link>
                        <Link to="/dashboard/expenses" className={getLinkClass('/dashboard/expenses')}><CreditCard size={20} /><span>Expenses</span></Link>
                        <Link to="/dashboard/maintenance" className={getLinkClass('/dashboard/maintenance')}><Wrench size={20} /><span>Maintenance</span></Link>
                        <Link to="/dashboard/cashflow" className={getLinkClass('/dashboard/cashflow')}><DollarSign size={20} /><span>Cash Flow</span></Link> {/* NEW LINK */}
                        <RoleGuard allowed={['Landlord', 'Agent']}>
                            <Link to="/dashboard/users" className={getLinkClass('/dashboard/users')}><Users size={20} /><span>Users & Invites</span></Link>
                        </RoleGuard>
                        <Link to="/dashboard/billing" className={getLinkClass('/dashboard/billing')}><CreditCard size={20} /><span>Billing</span></Link>
                        <Link to="/dashboard/audit-log" className={getLinkClass('/dashboard/audit-log')}><FileText size={20} /><span>Audit Log</span></Link>
                    </RoleGuard>

                    {/* Admin Panel Link - Only for Super Admins/Moderators */}
                    <RoleGuard allowed={['Super Admin', 'Super Moderator']}>
                        <hr className="my-4 border-white/10" />
                        <Link to="/admin" className={getLinkClass('/admin')}><Shield size={20} /><span>Admin Panel</span></Link>
                    </RoleGuard>

                </nav>
                <div className="p-4 border-t border-white/10">
                    <Link to="/dashboard/settings" className={getLinkClass('/dashboard/settings')}><Settings size={20} /><span>Settings</span></Link>
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 mt-1 font-semibold rounded-lg text-indigo-200 hover:bg-red-800/20 hover:text-white">
                        <LogOut size={20} /><span>Logout</span>
                    </button>
                </div>
            </aside>
        );
    };

    return (
        <div className="flex h-screen bg-brand-bg">
            <DesktopSidebar />
            
            <main className="flex-1 flex flex-col">
                <header className="h-20 bg-light-card border-b border-border-color flex-shrink-0 flex items-center justify-end px-4 sm:px-8">
                    <div className="flex items-center gap-6 ml-auto">
                        <NotificationsPanel />
                        <div className="h-8 border-l border-border-color"></div>
                        <div className="text-right">
                            <p className="font-semibold text-dark-text">{user?.name}</p>
                            <p className="text-sm text-light-text">{user?.role}</p>
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-4 sm:p-8 overflow-y-auto pb-20 md:pb-8">
                    <Outlet />
                </div>
            </main>

            <BottomNavBar />
        </div>
    );
};

export default DashboardLayout;
