import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import AddPropertyModal from '../components/common/AddPropertyModal';
import { useWindowSize } from '../hooks/useWindowSize';
import { Home, MapPin, Search, Edit, Trash2 } from 'lucide-react'; // Added Edit and Trash2 icons
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data;
};

const PropertiesPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { width } = useWindowSize();

    const { data: properties = [], isLoading, isError } = useQuery({
        queryKey: ['properties'],
        queryFn: fetchProperties,
    });

    // --- NEW: Mutation for deleting a property ---
    const deleteMutation = useMutation({
        mutationFn: (propertyId: string) => apiClient.delete(`/properties/${propertyId}`),
        onSuccess: () => {
            // Refetch the properties list to show the change
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            alert('Property deleted successfully!');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || "Failed to delete property.");
        }
    });

    const handleDeleteClick = (propertyId: string) => {
        if (window.confirm("Are you sure you want to permanently delete this property and all its associated data?")) {
            deleteMutation.mutate(propertyId);
        }
    };


    const handlePropertyAdded = () => {
        queryClient.invalidateQueries({ queryKey: ['properties'] });
    };
    
    const filteredProperties = useMemo(() => {
        // ... (no change to filtering logic)
        if (!searchTerm) return properties;
        return properties.filter(prop =>
            prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prop.address.formattedAddress.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, properties]);

    const getStatusClass = (status: string) => {
        // ... (no change to status class logic)
    };

    const DesktopView = () => (
        <div className="bg-light-card rounded-xl shadow-sm border border-border-color overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-border-color">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Property Name</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Address</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Units</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase">Status</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {filteredProperties.map((prop: any) => (
                            <tr key={prop._id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-semibold text-dark-text">{prop.name}</td>
                                <td className="p-4 text-light-text">{prop.address.formattedAddress}</td>
                                <td className="p-4 text-light-text">{prop.numberOfUnits}</td>
                                <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(prop.status)}`}>{prop.status}</span></td>
                                <td className="p-4 text-right flex items-center justify-end gap-2">
                                    <button onClick={() => navigate(`/dashboard/properties/${prop._id}`)} className="font-medium text-brand-primary hover:underline p-2 rounded-md hover:bg-gray-100" title="View Details">Manage</button>
                                    {/* Edit and Delete buttons can be added here for quick access */}
                                    <button onClick={() => {/* Open Edit Modal */}} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Edit Property"><Edit size={16} /></button>
                                    <button onClick={() => handleDeleteClick(prop._id)} disabled={deleteMutation.isLoading} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Delete Property"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Mobile view can also be updated with Edit/Delete buttons if desired...
    const MobileView = () => (
        // ...
    );

    if (isLoading) return <div className="text-center p-8">Loading properties...</div>;
    if (isError) return <div className="text-red-500 text-center p-8">Failed to fetch properties.</div>;

    return (
        <div>
            <AddPropertyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPropertyAdded={handlePropertyAdded} />
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-dark-text">Manage Properties</h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-bold rounded-lg shadow-md transition-colors">
                    <span>+ Add Property</span>
                </button>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text" size={20} />
                <input
                    type="text"
                    placeholder="Search by property name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-light-card border border-border-color rounded-lg"
                />
            </div>

            {filteredProperties.length === 0 ? (
                <div className="text-center py-16 bg-light-card rounded-xl border border-dashed">
                    <h3 className="text-xl font-semibold text-dark-text">No Properties Found</h3>
                    <p className="text-light-text mt-2 mb-4">{searchTerm ? `No results for "${searchTerm}".` : "Get started by adding your first property."}</p>
                </div>
            ) : (
                width < 768 ? <MobileView /> : <DesktopView />
            )}
        </div>
    );
};

export default PropertiesPage;
