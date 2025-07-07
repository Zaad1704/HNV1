// frontend/src/pages/MaintenanceRequestsPage.tsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useWindowSize } from '../hooks/useWindowSize';
import SearchFilter from '../components/common/SearchFilter';
import BulkActions from '../components/common/BulkActions';
import ExportModal from '../components/common/ExportModal';
import UniversalSearch, { SearchFilters } from '../components/common/UniversalSearch';
import UniversalExport from '../components/common/UniversalExport';
import AddMaintenanceModal from '../components/common/AddMaintenanceModal';
import MessageButtons from '../components/common/MessageButtons';
import { Wrench, Calendar, Home, AlertCircle, Users, Download, Plus, Trash2, Sparkles, Archive, Eye, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDataExport } from '../hooks/useDataExport';

const fetchRequests = async () => {
    try {
        const { data } = await apiClient.get('/maintenance'); 
        return data.data || [];
    } catch (error) {
        console.error('Failed to fetch maintenance requests:', error);
        return [];
    }
};

const updateRequestStatus = async ({ id, status }: { id: string, status: string }) => {
    const { data } = await apiClient.put(`/maintenance/${id}`, { status });
    return data.data;
};

const MaintenanceRequestsPage = () => {
    const queryClient = useQueryClient();
    const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<any>({});
    const [showExportModal, setShowExportModal] = useState(false);
    const [showUniversalExport, setShowUniversalExport] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        query: '',
        dateRange: 'all',
        status: '',
        sortBy: 'date',
        sortOrder: 'desc'
    });
    const { exportData } = useDataExport() || { exportData: () => {} };
    const { data: requests = [], isLoading, isError } = useQuery({ 
        queryKey: ['maintenanceRequests'], 
        queryFn: fetchRequests,
        retry: 1,
        onError: (error) => console.error('Maintenance requests error:', error)
    });
    const { width } = useWindowSize() || { width: 1024 };

    const filteredRequests = useMemo(() => {
        if (!requests) return [];
        
        return requests.filter((request: any) => {
            const matchesSearch = !searchQuery || 
                request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                request.requestedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                request.propertyId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = !filters.status || request.status === filters.status;
            
            return matchesSearch && matchesStatus;
        });
    }, [requests, searchQuery, filters]);

    const filterOptions = [
        {
            key: 'status',
            label: 'Status',
            type: 'select' as const,
            options: [
                { value: 'Open', label: 'Open' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Resolved', label: 'Resolved' },
                { value: 'Closed', label: 'Closed' }
            ]
        }
    ];

    const bulkActions = [
        {
            key: 'export',
            label: 'Export',
            icon: Download,
            color: 'bg-blue-500 hover:bg-blue-600 text-white',
            action: async (ids: string[]) => {
                await exportData('maintenance', 'maintenance-requests', { format: 'xlsx', filters: { ids } });
            }
        },
        {
            key: 'close',
            label: 'Mark Closed',
            icon: AlertCircle,
            color: 'bg-gray-500 hover:bg-gray-600 text-white',
            action: (ids: string[]) => {
                ids.forEach(id => handleStatusChange(id, 'Closed'));
            }
        }
    ];

    const mutation = useMutation({
        mutationFn: updateRequestStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenanceRequests'] });
        },
        onError: (err: any) => {
            alert(`Failed to update request status: ${err.response?.data?.message || err.message}`);
        }
    });

    const handleStatusChange = (id: string, newStatus: string) => {
        mutation.mutate({ id, status: newStatus });
    };

    const handleRequestAdded = (newRequest: any) => {
        queryClient.setQueryData(['maintenanceRequests'], (old: any) => [...(old || []), newRequest]);
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'Open': 'bg-brand-primary/20 text-brand-primary',
            'In Progress': 'bg-yellow-500/20 text-yellow-300',
            'Completed': 'bg-green-500/20 text-green-300',
            'Closed': 'bg-gray-500/20 text-gray-300'
        };
        return statusMap[status] || 'bg-gray-500/20 text-gray-300';
    };
    
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
    };

    if (isLoading) return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading requests...</div>;
    if (isError) return <div className="text-center p-8 text-red-400 dark:text-red-400">Failed to fetch maintenance requests.</div>;

    const DesktopView = () => (
        <div className="bg-light-card rounded-3xl shadow-lg border border-border-color overflow-hidden dark:bg-dark-card dark:border-border-color-dark">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-light-bg/50 border-b border-border-color dark:bg-dark-bg/50 dark:border-border-color-dark">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Select</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Date</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Tenant</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Property</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Issue</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map((req: any) => (
                            <tr key={req._id} className="hover:bg-light-bg/50 transition-colors duration-150 dark:hover:bg-dark-bg/40">
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedRequests.includes(req._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedRequests(prev => [...prev, req._id]);
                                            } else {
                                                setSelectedRequests(prev => prev.filter(id => id !== req._id));
                                            }
                                        }}
                                        className="w-4 h-4 rounded border-2"
                                    />
                                </td>
                                <td className="p-4 text-light-text dark:text-light-text-dark">{new Date(req.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 font-semibold text-dark-text dark:text-dark-text-dark">{req.requestedBy?.name || 'N/A'}</td>
                                <td className="p-4 text-light-text dark:text-light-text-dark">{req.propertyId?.name || 'N/A'}</td>
                                <td className="p-4 text-light-text dark:text-light-text-dark">{req.description}</td>
                                <td className="p-4">
                                    <select 
                                        value={req.status} 
                                        onChange={(e) => handleStatusChange(req._id, e.target.value)}
                                        className={`border-0 rounded-md py-1 px-2 text-xs font-semibold ${getStatusBadge(req.status)} bg-light-bg dark:bg-dark-card dark:text-dark-text-dark`}
                                        style={{ appearance: 'none' }}
                                        disabled={mutation.isLoading}
                                    >
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </td>
                            </tr>
                        ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-light-text dark:text-light-text-dark">No maintenance requests found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const MobileView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req: any, index: number) => (
                <motion.div 
                    key={req._id} 
                    className="group app-surface rounded-3xl p-6 border border-app-border hover:shadow-2xl hover:shadow-brand-blue/10 hover:border-brand-blue/30 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-purple-500/5 to-brand-orange/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <div className="relative z-10 flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Wrench size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary text-lg group-hover:text-brand-blue transition-colors">
                                    {req.description}
                                </h3>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm ${
                                    req.status === 'Open' ? 'bg-yellow-100/90 text-yellow-800' :
                                    req.status === 'In Progress' ? 'bg-blue-100/90 text-blue-800' :
                                    req.status === 'Resolved' ? 'bg-green-100/90 text-green-800' :
                                    'bg-gray-100/90 text-gray-800'
                                }`}>
                                    {req.status === 'Resolved' && <CheckCircle size={10} className="inline mr-1" />}
                                    {req.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-1 dark:text-light-text-dark"><Home size={14}/> Property: {req.propertyId?.name || 'N/A'}</p>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-2 dark:text-light-text-dark"><Calendar size={14}/> Date: {new Date(req.createdAt).toLocaleDateString()}</p>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-2 dark:text-light-text-dark"><Users size={14}/> Requested By: {req.requestedBy?.name || 'N/A'}</p>
                    
                    <div className="mt-3">
                        <label htmlFor={`status-${req._id}`} className="block text-sm font-medium text-light-text mb-1 dark:text-light-text-dark">Update Status:</label>
                        <select 
                            id={`status-${req._id}`}
                            value={req.status} 
                            onChange={(e) => handleStatusChange(req._id, e.target.value)}
                            className={`block w-full border border-border-color rounded-md py-2 px-3 text-dark-text bg-light-bg focus:ring-brand-primary focus:border-brand-primary dark:bg-dark-bg dark:border-border-color-dark dark:text-dark-text-dark`}
                            disabled={mutation.isLoading}
                        >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    return (
        <motion.div 
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={{ duration: 0.4 }}
            className="text-dark-text dark:text-dark-text-dark"
        >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
                            Maintenance Requests
                        </span>
                        <Sparkles size={28} className="text-brand-orange animate-pulse" />
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-text-secondary">
                            Manage property maintenance requests ({requests.length} total)
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-text-secondary">Show:</span>
                            <button
                                onClick={() => setShowArchived(false)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                    !showArchived 
                                        ? 'bg-blue-100 text-blue-800 shadow-sm' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Eye size={12} className="inline mr-1" />
                                Active ({requests.filter(r => r.status !== 'Closed').length})
                            </button>
                            <button
                                onClick={() => setShowArchived(true)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                    showArchived 
                                        ? 'bg-orange-100 text-orange-800 shadow-sm' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Archive size={12} className="inline mr-1" />
                                Closed ({requests.filter(r => r.status === 'Closed').length})
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowUniversalExport(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2"
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="group btn-gradient px-8 py-4 rounded-3xl flex items-center gap-3 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                            <Plus size={14} className="text-white" />
                        </div>
                        Add Request
                    </button>
                </div>
            </div>

            <UniversalSearch
                onSearch={setSearchFilters}
                placeholder="Search maintenance requests..."
                showStatusFilter={true}
                statusOptions={[
                    { value: 'Open', label: 'Open' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Resolved', label: 'Resolved' },
                    { value: 'Closed', label: 'Closed' }
                ]}
            />
            {requests.length > 0 ? (
                width < 768 ? <MobileView /> : <DesktopView />
            ) : (
                <div className="text-center py-16 bg-light-card rounded-3xl border border-dashed border-border-color dark:bg-dark-card dark:border-border-color-dark">
                    <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark">No Maintenance Requests Found</h3>
                    <p className="text-light-text mt-2 mb-4 dark:text-light-text-dark">You can submit requests from your tenant portal or properties page.</p>
                </div>
            )}

            <BulkActions
                selectedItems={selectedRequests}
                totalItems={filteredRequests?.length || 0}
                onSelectAll={() => setSelectedRequests(filteredRequests?.map((r: any) => r._id) || [])}
                onClearSelection={() => setSelectedRequests([])}
                actions={bulkActions}
            />

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                section="maintenance"
                title="Maintenance Requests"
            />
            
            <UniversalExport
                isOpen={showUniversalExport}
                onClose={() => setShowUniversalExport(false)}
                data={filteredRequests}
                filename="maintenance-requests"
                filters={searchFilters}
                title="Export Maintenance Requests"
            />

            <AddMaintenanceModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onRequestAdded={handleRequestAdded}
            />
        </motion.div>
    );
};

export default MaintenanceRequestsPage;
