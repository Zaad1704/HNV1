import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ChevronLeft, MapPin, Home, Users, Edit, Trash2, FileText } from 'lucide-react';
import { ITenant } from './TenantsPage';
import EditPropertyModal from '../components/common/EditPropertyModal';

const fetchPropertyDetails = async (propertyId: string) => {
    const { data } = await apiClient.get(`/properties/${propertyId}`);
    return data.data;
};

const fetchTenantsForProperty = async () => {
    const { data } = await apiClient.get('/tenants');
    return data.data;
};

const PropertyDetailsPage = () => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (!propertyId) {
        return <div className="text-red-400 text-center p-8 dark:text-red-400">Invalid property ID.</div>;
    }

    const { data: property, isLoading: isLoadingProperty, isError: isErrorProperty } = useQuery({
        queryKey: ['propertyDetails', propertyId],
        queryFn: () => fetchPropertyDetails(propertyId),
    });

    const { data: tenants = [] } = useQuery<ITenant[], Error>({
        queryKey: ['tenants'],
        queryFn: fetchTenantsForProperty,
    });
    
    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/properties/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            navigate('/dashboard/properties');
        },
        onError: (err: any) => alert(err.response?.data?.message || "Failed to delete property.")
    });

    const handleDeleteClick = () => {
        if (window.confirm("Are you sure you want to permanently delete this property? This will also affect associated tenants and records.")) {
            deleteMutation.mutate(propertyId);
        }
    };

    const propertyTenants = tenants.filter(tenant => tenant.propertyId?._id === propertyId);

    if (isLoadingProperty) {
        return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading property details...</div>;
    }
    if (isErrorProperty) {
        return <div className="text-red-400 text-center p-8 dark:text-red-400">Failed to load property details.</div>;
    }

    return (
        <div className="text-dark-text dark:text-dark-text-dark">
            <EditPropertyModal 
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              property={property}
              onPropertyUpdated={() => {
                queryClient.invalidateQueries({ queryKey: ['propertyDetails', propertyId] });
              }}
            />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                  <Link to="/dashboard/properties" className="text-light-text dark:text-light-text-dark hover:text-brand-primary dark:hover:text-brand-secondary transition-colors duration-150" title="Back to Properties List">
                      <ChevronLeft size={24} />
                  </Link>
                  <h1 className="text-3xl font-bold">{property?.name || 'Property Details'}</h1>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-light-card dark:bg-dark-card border border-border-color dark:border-border-color-dark rounded-lg text-dark-text dark:text-dark-text-dark font-semibold hover:bg-light-bg dark:hover:bg-dark-bg/40 transition-colors"><Edit size={16} /> Edit Profile</button>
                  <button onClick={handleDeleteClick} disabled={deleteMutation.isLoading} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"><Trash2 size={16}/> Delete</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  {property?.imageUrl && (
                      <div className="bg-light-card dark:bg-dark-card rounded-xl border border-border-color dark:border-border-color-dark shadow-lg overflow-hidden transition-all duration-200">
                          <img src={property.imageUrl} alt={property.name} className="w-full h-56 object-cover"/>
                      </div>
                  )}
                  <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-border-color dark:border-border-color-dark shadow-lg space-y-4 transition-all duration-200">
                    <h3 className="text-xl font-bold text-dark-text dark:text-dark-text-dark mb-2">Property Info</h3>
                    <p className="flex items-center gap-3 text-light-text dark:text-light-text-dark"><MapPin size={16} className="text-brand-primary dark:text-brand-secondary"/> {property?.address?.formattedAddress}</p>
                    <p className="flex items-center gap-3 text-light-text dark:text-light-text-dark"><Home size={16} className="text-brand-primary dark:text-brand-secondary"/> {property?.numberOfUnits} units</p>
                    <p className="flex items-center gap-3 text-light-text dark:text-light-text-dark"><Users size={16} className="text-brand-primary dark:text-brand-secondary"/> {propertyTenants.length} tenants</p>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-light-card dark:bg-dark-card p-6 rounded-xl border border-border-color dark:border-border-color-dark shadow-lg transition-all duration-200">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Users size={22} className="text-brand-primary dark:text-brand-secondary" /> Tenants in this Property</h2>
                    <div className="divide-y divide-border-color dark:divide-border-color-dark">
                      {propertyTenants.length > 0 ? propertyTenants.map(tenant => (
                          <div key={tenant._id} className="flex justify-between items-center py-3 hover:bg-light-bg dark:hover:bg-dark-bg/40 transition-colors duration-150">
                              <div>
                                <p className="font-semibold text-dark-text dark:text-dark-text-dark">{tenant.name} <span className="text-sm text-light-text dark:text-light-text-dark">(Unit {tenant.unit})</span></p>
                                <p className="text-sm text-light-text dark:text-light-text-dark">{tenant.email}</p>
                              </div>
                              <Link to={`/dashboard/tenants/${tenant._id}/profile`} className="font-medium text-sm text-brand-primary dark:text-brand-secondary hover:underline transition-colors">
                                  View Profile
                              </Link>
                          </div>
                      )) : (
                        <p className="text-center py-8 text-light-text dark:text-light-text-dark">No tenants have been assigned to this property yet.</p>
                      )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;
