import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import AddPropertyModal from '../components/common/AddPropertyModal';
import EditPropertyModal from '../components/common/EditPropertyModal';
import { useWindowSize } from '../hooks/useWindowSize';
import { Home, MapPin, Search, Edit, Trash2, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data;
};

const PropertiesPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { width } = useWindowSize();

    const { data: properties = [], isLoading, isError } = useQuery({
        queryKey: ['properties'],
        queryFn: fetchProperties,
    });

    const deleteMutation = useMutation({
        mutationFn: (propertyId: string) => apiClient.delete(`/properties/${propertyId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            alert('Property deleted successfully!');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || "Failed to delete property.");
        }
    });

    const handleExport = async (format: 'csv' | 'pdf') => {
        try {
            const response = await apiClient.get('/reports/properties/export', {
                params: { format },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `properties-export.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Failed to export properties:", error);
            alert("Could not export properties.");
        }
    };

    const handleEditClick = (property: any) => {
        setSelectedProperty(property);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (propertyId: string) => {
        if (window.confirm("Are you sure you want to permanently delete this property?")) {
            deleteMutation.mutate(propertyId);
        }
    };

    const handlePropertyAdded = () => {
        queryClient.invalidateQueries({ queryKey: ['properties'] });
    };
    
    const filteredProperties = useMemo(() => {
        if (!searchTerm) return properties;
        return properties.filter((prop: any) =>
            prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (prop.address?.formattedAddress || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, properties]);

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-500/20 text-green-300';
            case 'Under Renovation': return 'bg-brand-accent-dark/20 text-brand-accent-dark';
            default: return 'bg-light-text/20 text-light-text';
        }
    };

    const DesktopView = () => (
        <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden dark:bg-dark-card dark:border-border-color-dark">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-light-bg border-b border-border-color dark:bg-dark-bg/50 dark:border-border-color-dark">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Property Name</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Address</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Units</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Status</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase text-right dark:text-light-text-dark">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
                        {filteredProperties.map((prop: any) => (
                            <tr key={prop._id} className="hover:bg-light-bg transition-colors duration-150 dark:hover:bg-dark-bg/40">
                                <td className="p-4 font-semibold text-dark-text dark:text-dark-text-dark">{prop.name}</td>
                                <td className="p-4 text-light-text dark:text-light-text-dark">{prop.address.formattedAddress}</td>
                                <td className="p-4 text-light-text dark:text-light-text-dark">{prop.numberOfUnits}</td>
                                <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(prop.status)}`}>{prop.status}</span></td>
                                <td className="p-4 text-right flex items-center justify-end gap-2">
                                    <button onClick={() => navigate(`/dashboard/properties/${prop._id}`)} className="font-medium text-brand-primary hover:underline p-2 rounded-md hover:bg-light-bg transition-colors duration-150 dark:hover:bg-dark-bg/50" title="View Details">Manage</button>
                                    <button onClick={() => handleEditClick(prop)} className="p-2 text-light-text hover:bg-light-bg rounded-md transition-colors duration-150 dark:hover:bg-dark-bg/50 dark:text-light-text-dark" title="Edit Property"><Edit size={16} /></button>
                                    <button onClick={() => handleDeleteClick(prop._id)} disabled={deleteMutation.isLoading} className="p-2 text-brand-orange hover:bg-red-500/10 rounded-md transition-colors duration-150 dark:hover:bg-red-500/20" title="Delete Property"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const MobileView = () => (
        <div className="grid grid-cols-1 gap-4">
            {filteredProperties.map((prop: any) => (
                <div key={prop._id} className="bg-light-card p-4 rounded-xl border border-border-color shadow-sm transition-all duration-150 dark:bg-dark-card dark:border-border-color-dark" onClick={() => navigate(`/dashboard/properties/${prop._id}`)}>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-dark-text text-lg dark:text-dark-text-dark">{prop.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(prop.status)}`}>{prop.status}</span>
                    </div>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-1 dark:text-light-text-dark"><MapPin size={14}/> {prop.address.formattedAddress}</p>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-1 dark:text-light-text-dark"><Home size={14}/> {prop.numberOfUnits} Units</p>
                    <div className="flex justify-end mt-4">
                        <span className="font-medium text-sm text-brand-primary">View Details &rarr;</span>
                    </div>
                </div>
            ))}
        </div>
    );

    if (isLoading) return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading properties...</div>;
    if (isError) return <div className="text-red-400 text-center p-8">Failed to fetch properties.</div>;

    return (
        <div>
            <AddPropertyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onPropertyAdded={handlePropertyAdded} />
            <EditPropertyModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} property={selectedProperty} onPropertyUpdated={handlePropertyAdded} />
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-dark-text dark:text-dark-text-dark">Manage Properties</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2.5 bg-brand-secondary text-white font-bold rounded-lg hover:bg-brand-primary transition-colors duration-200"><Download size={18} /> CSV</button>
                    <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2.5 bg-brand-orange text-white font-bold rounded-lg hover:bg-orange-700 transition-colors duration-200"><Download size={18} /> PDF</button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg shadow-md transition-colors duration-200">
                        <span>+ Add Property</span>
                    </button>
                </div>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text dark:text-light-text-dark" size={20} />
                <input
                    type="text"
                    placeholder="Search by property name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-light-card border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all duration-150 dark:bg-dark-card dark:border-border-color-dark dark:text-dark-text-dark"
                />
            </div>

            {filteredProperties.length === 0 ? (
                <div className="text-center py-16 bg-light-card rounded-xl border border-dashed border-border-color dark:bg-dark-card dark:border-border-color-dark">
                    <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark">No Properties Found</h3>
                    <p className="text-light-text mt-2 mb-4 dark:text-light-text-dark">{searchTerm ? `No results for "${searchTerm}".` : "Get started by adding your first property."}</p>
                </div>
            ) : (
                width < 768 ? <MobileView /> : <DesktopView />
            )}
        </div>
    );
};

export default PropertiesPage;
