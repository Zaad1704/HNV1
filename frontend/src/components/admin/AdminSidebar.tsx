import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getLinkClass = (path: string) => {
        return location.pathname.startsWith(path)
          ? 'bg-indigo-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white';
    };

    return (
        <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col flex-shrink-0">
            <div className="h-20 flex items-center justify-center border-b border-gray-700">
                <h2 className="text-xl font-bold text-center">Admin Panel</h2>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <Link to="/admin/dashboard" className={`block px-4 py-2.5 rounded-lg font-semibold ${getLinkClass('/admin/dashboard')}`}>Dashboard</Link>
                <Link to="/admin/organizations" className={`block px-4 py-2.5 rounded-lg font-semibold ${getLinkClass('/admin/organizations')}`}>Organizations</Link>
                <Link to="/admin/users" className={`block px-4 py-2.5 rounded-lg font-semibold ${getLinkClass('/admin/users')}`}>Users</Link>
                <Link to="/admin/plans" className={`block px-4 py-2.5 rounded-lg font-semibold ${getLinkClass('/admin/plans')}`}>Manage Plans</Link>
                {/* FIX: The text "Site Editor" and the closing </Link> tag were added here. */}
                <Link to="/admin/site-editor" className={`block px-4 py-2.5 rounded-lg font-semibold ${getLinkClass('/admin/site-editor')}`}>Site Editor</Link>
                <Link to="/admin/billing" className={`block px-4 py-2.5 rounded-lg font-semibold ${getLinkClass('/admin/billing')}`}>Billing</Link>
            </nav>
            <div className="p-4 border-t border
