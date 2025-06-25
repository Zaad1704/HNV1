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
        return <div className="text-red-400 text-center p-8">Invalid property ID.</div>;
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
        return <div className="text-center p-8 text-dark-text">Loading property details...</div>;
    }
    if (isErrorProperty) {
        return <div className="text-red-400 text-center p-8">Failed to load property details.</div>;
    }

    return (
        <div className="text-dark-text">
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
                  <Link to="/dashboard/properties" className="text-light-text hover:text-brand-primary" title="Back to Properties">
                      <ChevronLeft size={24} />
                  </Link>
                  <h1 className="text-3xl font-bold">{property?.name || 'Property Details'}</h1>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-light-card border border-border-color rounded-lg text-dark-text font-semibold hover:bg-opacity-80"><Edit size={16}/> Edit</button>
                  <button onClick={handleDeleteClick} disabled={deleteMutation.isLoading} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"><Trash2 size={16}/> Delete</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  {property?.imageUrl && (
                      <div className="bg-light-card rounded-xl border border-border-color shadow-lg overflow-hidden">
                          <img src={property.imageUrl} alt={property.name} className="w-full h-56 object-cover"/>
                      </div>
                  )}
                  <div className="bg-light-card p-6 rounded-xl border border-border-color shadow-lg space-y-4">
                    <h3 className="text-xl font-bold text-dark-text mb-2">Property Info</h3>
                    <p className="flex items-center gap-3 text-dark-text"><MapPin size={16} className="text-light-text"/> {property?.address?.formattedAddress}</p>
                    <p className="flex items-center gap-3 text-dark-text"><Home size={16} className="text-light-text"/> {property?.numberOfUnits} units</p>
                    <p className="flex items-center gap-3 text-dark-text"><Users size={16} className="text-light-text"/> {propertyTenants.length} tenants</p>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-light-card p-6 rounded-xl border border-border-color shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Users size={22} /> Tenants in this Property</h2>
                    <div className="divide-y divide-border-color">
                      {propertyTenants.length > 0 ? propertyTenants.map(tenant => (
                          <div key={tenant._id} className="flex justify-between items-center py-3">
                              <div>
                                <p className="font-semibold text-dark-text">{tenant.name} <span className="text-sm text-light-text">(Unit {tenant.unit})</span></p>
                                <p className="text-sm text-light-text">{tenant.email}</p>
                              </div>
                              <Link to={`/dashboard/tenants/${tenant._id}/profile`} className="font-medium text-sm text-brand-primary hover:underline">
                                  View Profile
                              </Link>
                          </div>
                      )) : (
                        <p className="text-center py-8 text-light-text">No tenants have been assigned to this property yet.</p>
                      )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;
