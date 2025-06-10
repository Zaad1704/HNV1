import React from 'react';
import { Link } from 'react-router-dom';

// Placeholder Icons - a developer would use a library like Lucide React
const UsersIcon = () => <span>👥</span>;
const OrgsIcon = () => <span>🏢</span>;
const BillingIcon = () => <span>💳</span>;
const ContentIcon = () => <span>🎨</span>;

const AdminDashboardPage = () => {
    // This data would be fetched from dedicated backend APIs
    const stats = {
        totalUsers: 142,
        activeSubscriptions: 35,
        monthlyRecurringRevenue: 485.00,
        contentPages: 5
    };

    return (
        <div className="text-white">
            <h1 className="text-4xl font-bold mb-8">Super Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase">Total Users</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
                </div>
                <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase">Active Subscriptions</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.activeSubscriptions}</p>
                </div>
                <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase">Monthly Revenue</h3>
                    <p className="text-3xl font-bold text-white mt-2">${stats.monthlyRecurringRevenue.toFixed(2)}</p>
                </div>
                 <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase">Content Pages</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.contentPages}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-2xl font-bold mb-6">Management Panels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/admin/users" className="block p-6 bg-blue-600 rounded-2xl text-white text-center hover:bg-blue-500 transition-all transform hover:scale-105 shadow-lg">
                    <UsersIcon />
                    <h3 className="text-xl font-bold mt-2">Manage Users</h3>
                </Link>
                 <Link to="/admin/organizations" className="block p-6 bg-emerald-600 rounded-2xl text-white text-center hover:bg-emerald-500 transition-all transform hover:scale-105 shadow-lg">
                    <OrgsIcon />
                    <h3 className="text-xl font-bold mt-2">Manage Organizations</h3>
                </Link>
                 <Link to="/admin/billing" className="block p-6 bg-pink-600 rounded-2xl text-white text-center hover:bg-pink-500 transition-all transform hover:scale-105 shadow-lg">
                    <BillingIcon />
                    <h3 className="text-xl font-bold mt-2">View Billing</h3>
                </Link>
                 <Link to="/admin/site-editor" className="block p-6 bg-orange-600 rounded-2xl text-white text-center hover:bg-orange-500 transition-all transform hover:scale-105 shadow-lg">
                    <ContentIcon />
                    <h3 className="text-xl font-bold mt-2">Edit Website Content</h3>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
