import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar: React.FC = () => {
    const location = useLocation();

    const getLinkClass = (path: string) => {
        return location.pathname === path
          ? 'bg-indigo-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white';
    };

    return (
        <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4">
            <h2 className="text-xl font-bold mb-6 text-center">Admin Menu</h2>
            <nav className="flex flex-col gap-2">
                <Link to="/admin/dashboard" className={`px-4 py-2 rounded-lg ${getLinkClass('/admin/dashboard')}`}>Dashboard</Link>
                <Link to="/admin/organizations" className={`px-4 py-2 rounded-lg ${getLinkClass('/admin/organizations')}`}>Organizations</Link>
                <Link to="/admin/users" className={`px-4 py-2 rounded-lg ${getLinkClass('/admin/users')}`}>Users</Link>
                <Link to="/admin/plans" className={`px-4 py-2 rounded-lg ${getLinkClass('/admin/plans')}`}>Manage Plans</Link>
                <Link to="/admin/site-editor" className={`px-4 py-2 rounded-lg ${getLinkClass('/admin/site-editor')}`}>Site Editor</Link>
                <Link to="/admin/billing" className={`px-4 py-2 rounded-lg ${getLinkClass('/admin/billing')}`}>Billing</Link>
                <hr className="my-4 border-gray-600"/>
                <Link to="/admin/profile" className={`px-4 py-2 rounded-lg ${getLinkClass('/admin/profile')}`}>My Profile</Link>
                <Link to="/dashboard" className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white">Exit Admin</Link>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
