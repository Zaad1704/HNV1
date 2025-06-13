import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

const AdminDataManagementPage = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/super-admin/data-management');
                setRequests(response.data.data);
            } catch (err) {
                setError('Failed to fetch data management requests.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (dateString?: string) => {
        return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    };

    const getStatusClass = (status: string) => {
        switch(status) {
            case 'pending_deletion': return 'text-red-400';
            case 'suspended_by_admin': return 'text-yellow-400';
            default: return 'text-slate-300';
        }
    };
    
    if (loading) return <div className="text-white text-center p-8">Loading Data...</div>;
    if (error) return <div className="text-red-400 text-center p-8">{error}</div>;

    return (
        <div className="text-white">
            <h1 className="text-4xl font-bold mb-8">Data & Deletion Requests</h1>
            <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Organization</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Status</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Data Export Requested</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Deletion Requested</th>
                                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {requests.map(org => (
                                <tr key={org._id} className="hover:bg-slate-800">
                                    <td className="p-4">
                                        <p className="font-bold text-white">{org.name}</p>
                                        <p className="text-xs text-slate-400">{org.owner.name}</p>
                                    </td>
                                    <td className="p-4 font-semibold">
                                        <span className={getStatusClass(org.status)}>{org.status.replace('_', ' ')}</span>
                                    </td>
                                    <td className="p-4 text-slate-300">{formatDate(org.dataManagement?.dataExportRequestedAt)}</td>
                                    <td className="p-4 text-slate-300">{formatDate(org.dataManagement?.accountDeletionRequestedAt)}</td>
                                    <td className="p-4 space-x-2">
                                        <button disabled={!org.dataManagement?.dataExportRequestedAt} className="text-xs bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed">Approve Export</button>
                                        <button disabled={org.status !== 'pending_deletion'} className="text-xs bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-500 disabled:bg-slate-600 disabled:cursor-not-allowed">Confirm Deletion</button>
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

export default AdminDataManagementPage;
