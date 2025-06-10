import React, { useState, useMemo, useEffect } from 'react';
import apiClient from '../api/apiClient'; // We will build the API endpoint for this next

const AdminOrganizationsPage = () => {
    // This data would be fetched from a dedicated backend API: GET /api/super-admin/organizations
    const [organizations, setOrganizations] = useState([
        { id: 'org_01', name: 'Alice\'s Agency', owner: 'Agent Alice', plan: 'Agent Pro', userCount: 5, status: 'Active' },
        { id: 'org_02', name: 'Bob\'s Properties', owner: 'Landlord Bob', plan: 'Landlord Basic', userCount: 2, status: 'Active' },
        { id: 'org_03', name: 'Charlie\'s Holdings', owner: 'Inactive Charlie', plan: 'Free', userCount: 1, status: 'Inactive' },
        { id: 'org_04', name: 'Dave\'s Dwellings', owner: 'Agent Dave', plan: 'Agent Pro', userCount: 12, status: 'Active' },
        { id: 'org_05', name: 'HNV Global Headquarters', owner: 'Super Administrator', plan: 'Super Admin', userCount: 1, status: 'Active' },
    ]);
    const [loading, setLoading] = useState(false); // Will be set to true when we fetch real data
    const [error, setError] = useState('');

    const getStatusClass = (status) => {
        return status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/50 text-slate-400';
    };
    
    const getPlanClass = (plan) => {
        if (plan.includes('Agent')) return 'bg-sky-500/20 text-sky-400';
        if (plan.includes('Landlord')) return 'bg-pink-500/20 text-pink-400';
        if (plan.includes('Admin')) return 'bg-amber-500/20 text-amber-400';
        return 'bg-slate-600/50 text-slate-400';
    };

    if (loading) return <div className="text-white text-center p-8">Loading organizations...</div>;
    if (error) return <div className="text-red-400 text-center p-8">{error}</div>;

    return (
        <div className="text-white">
            <h1 className="text-4xl font-bold mb-8">Manage All Organizations</h1>

            {/* Organizations Table */}
            <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Organization Name</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Owner</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Subscription Plan</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Users</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Status</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {organizations.map(org => (
                                <tr key={org.id} className="hover:bg-slate-800 transition-colors">
                                    <td className="p-4 font-bold text-white">{org.name}</td>
                                    <td className="p-4 text-slate-300">{org.owner}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPlanClass(org.plan)}`}>
                                            {org.plan}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-300">{org.userCount}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(org.status)}`}>
                                            {org.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button className="font-medium text-blue-400 hover:text-blue-300">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrganizationsPage;
