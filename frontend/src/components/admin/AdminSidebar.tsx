import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LayoutDashboard, Building, Users, CreditCard, Brush, LifeBuoy, LogOut, ShieldCheck, ArrowLeft } from 'lucide-react';

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getLinkClass = (path: string) => {
        const base = 'flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-colors';
        return location.pathname.startsWith(path)
          ? `${base} bg-brand-primary text-brand-dark`
          : `${base} text-light-text hover:bg-light-card/50`;
    };

    return (
        <aside className="w-64 h-screen bg-light-card text-dark-text flex flex-col flex-shrink-0 border-r border-border-color">
            <div className="h-20 flex items-center justify-center border-b border-border-color">
                <h2 className="text-xl font-bold text-center text-dark-text flex items-center gap-2"><ShieldCheck /> Admin Panel</h2>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <Link to="/admin/dashboard" className={getLinkClass('/admin/dashboard')}><LayoutDashboard size={18}/> Dashboard</Link>
                <Link to="/admin/organizations" className={getLinkClass('/admin/organizations')}><Building size={18}/> Organizations</Link>
                <Link to="/admin/users" className={getLinkClass('/admin/users')}><Users size={18}/> Users</Link>
                <Link to="/admin/moderators" className={getLinkClass('/admin/moderators')}><Users size={18}/> Moderators</Link>
                <Link to="/admin/plans" className={getLinkClass('/admin/plans')}><CreditCard size={18}/> Manage Plans</Link>
                <Link to="/admin/site-editor" className={getLinkClass('/admin/site-editor')}><Brush size={18}/> Site Editor</Link>
                <Link to="/admin/billing" className={getLinkClass('/admin/billing')}><LifeBuoy size={18}/> Billing</Link>
            </nav>
            <div className="p-4 border-t border-border-color space-y-2">
                <Link to="/dashboard" className="flex items-center justify-center gap-2 w-full text-center px-4 py-2.5 rounded-lg font-semibold text-light-text bg-dark-bg/50 hover:bg-dark-bg">
                  <ArrowLeft size={16} /> Exit Admin
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 mt-2 font-semibold rounded-lg text-light-text hover:bg-red-500/20 hover:text-red-400">
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
