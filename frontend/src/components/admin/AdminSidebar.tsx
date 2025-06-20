import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const getLinkClass = (path: string) => {
        const base = 'block px-4 py-2.5 rounded-lg font-semibold transition-colors';
        return location.pathname.startsWith(path)
          ? `${base} bg-brand-orange text-white`
          : `${base} text-light-text hover:bg-gray-100 hover:text-dark-text`;
    };

    const canAccess = (permission: string) => {
        if (!user) return false;
        if (user.role === 'Super Admin') return true;
        return user.permissions?.includes(permission);
    };

    return (
        <aside className="w-64 h-screen bg-light-card text-dark-text flex flex-col flex-shrink-0 border-r border-border-color">
            <div className="h-20 flex items-center justify-center border-b border-border-color">
                <h2 className="text-xl font-bold text-center">Admin Panel</h2>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {/* These are the super admin functions */}
                {canAccess('can_view_reports') && <Link to="/admin/dashboard" className={getLinkClass('/admin/dashboard')}>Dashboard</Link>}
                {canAccess('can_manage_users') && <Link to="/admin/organizations" className={getLinkClass('/admin/organizations')}>Organizations</Link>}
                {canAccess('can_manage_users') && <Link to="/admin/users" className={getLinkClass('/admin/users')}>Users</Link>}
                {user?.role === 'Super Admin' && <Link to="/admin/moderators" className={getLinkClass('/admin/moderators')}>Moderators</Link>}
                {canAccess('can_manage_billing') && <Link to="/admin/plans" className={getLinkClass('/admin/plans')}>Manage Plans</Link>}
                {canAccess('can_manage_content') && <Link to="/admin/site-editor" className={getLinkClass('/admin/site-editor')}>Site Editor</Link>}
                {canAccess('can_manage_billing') && <Link to="/admin/billing" className={getLinkClass('/admin/billing')}>Billing</Link>}
            </nav>
            <div className="p-4 border-t border-border-color space-y-2">
                {/* ... profile and logout links ... */}
            </div>
        </aside>
    );
};

export default AdminSidebar;
