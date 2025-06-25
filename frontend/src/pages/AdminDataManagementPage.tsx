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
                // Assuming there's a /super-admin/data-management endpoint that returns data requests
                // If not, this endpoint might need to be created or data fetched from other admin endpoints.
                const response = await apiClient.get('/super-admin/organizations'); // Using existing orgs endpoint for demo purposes
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
            case 'pending_deletion': return 'text-brand-orange'; // Mapped to new accent color
            case 'suspended_by_admin': return 'text-brand-accent-dark'; // Mapped to new accent color
            default: return 'text-light-text dark:text-light-text-dark';
        }
    };
    
    if (loading) return <div className="text-dark-text dark:text-dark-text-dark text-center p-8">Loading Data...</div>;
    if (error) return <div className="text-red-400 text-center p-8 dark:text-red-400">{error}</div>;

    return (
        <div className="text-dark-text dark:text-dark-text-dark">
            <h1 className="text-4xl font-bold mb-8">Data & Deletion Requests</h1>
            <div className="bg-light-card dark:bg-dark-card/70 backdrop-blur-md rounded-2xl shadow-lg border border-border-color dark:border-border-color-dark overflow-hidden transition-all duration-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg dark:bg-dark-bg/50">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-light-text dark:text-light-text-dark uppercase">Organization</th>
                                <th className="p-4 text-sm font-semibold text-light-text dark:text-light-text-dark uppercase">Status</th>
                                <th className="p-4 text-sm font-semibold text-light-text dark:text-light-text-dark uppercase">Data Export Requested</th>
                                <th className="p-4 text-sm font-semibold text-light-text dark:text-light-text-dark uppercase">Deletion Requested</th>
                                <th className="p-4 text-sm font-semibold text-light-text dark:text-light-text-dark uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
                            {requests.map(org => (
                                <tr key={org._id} className="hover:bg-light-bg dark:hover:bg-dark-bg/40 transition-colors duration-150">
                                    <td className="p-4">
                                        <p className="font-bold text-dark-text dark:text-dark-text-dark">{org.name}</p>
                                        <p className="text-xs text-light-text dark:text-light-text-dark">{org.owner?.name}</p>
                                    </td>
                                    <td className="p-4 font-semibold">
                                        <span className={getStatusClass(org.status)}>{org.status.replace('_', ' ')}</span>
                                    </td>
                                    <td className="p-4 text-light-text dark:text-light-text-dark">{formatDate(org.dataManagement?.dataExportRequestedAt)}</td>
                                    <td className="p-4 text-light-text dark:text-light-text-dark">{formatDate(org.dataManagement?.accountDeletionRequestedAt)}</td>
                                    <td className="p-4 space-x-2">
                                        <button disabled={!org.dataManagement?.dataExportRequestedAt} className="text-xs bg-brand-primary text-white py-1 px-3 rounded-md hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Approve Export</button>
                                        <button disabled={org.status !== 'pending_deletion'} className="text-xs bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Confirm Deletion</button>
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
