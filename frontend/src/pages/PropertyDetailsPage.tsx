import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ChevronLeft, MapPin, Home, Users, Edit, Trash2 } from 'lucide-react';
import { ITenant } from './TenantsPage';
import EditPropertyModal from '../components/common/EditPropertyModal'; // Import the new modal

// Fetch a single property by its ID
const fetchPropertyDetails = async (propertyId: string) => {
    const { data } = await apiClient.get(`/properties/${propertyId}`);
    return data.data;
};

// Fetch all tenants to filter by property
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
        return <div className="text-red-500 text-center p-8">Invalid property ID.</div>;
    }

    const { data: property, isLoading: isLoadingProperty, isError: isErrorProperty } = useQuery({
        queryKey: ['propertyDetails', propertyId],
        queryFn: () => fetchPropertyDetails(propertyId),
    });

    const { data: tenants = [], isLoading: isLoadingTenants } = useQuery<ITenant[], Error>({
        queryKey: ['tenants'],
        queryFn: fetchTenantsForProperty,
    });
    
    // Same delete mutation as used on the main properties page
    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/properties/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            navigate('/dashboard/properties'); // Go back to the list after deletion
        },
        onError: (err: any) => alert(err.response?.data?.message || "Failed to delete property.")
    });

    const handleDeleteClick = () => {
        if (window.confirm("Are you sure you want to permanently delete this property?")) {
            deleteMutation.mutate(propertyId);
        }
    };

    const propertyTenants = tenants.filter(tenant => tenant.propertyId?._id === propertyId);

    if (isLoadingProperty || isLoadingTenants) {
        return <div className="text-center p-8">Loading property details...</div>;
    }
    if (isErrorProperty) {
        return <div className="text-red-500 text-center p-8">Failed to load property details.</div>;
    }

    return (
        <div className="text-dark-text">
            {/* Render the Edit modal, controlled by component state */}
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
              {/* Add Edit and Delete Buttons */}
              <div className="flex items-center gap-2">
                  <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-light-card border rounded-lg text-dark-text font-semibold hover:bg-gray-100"><Edit size={16}/> Edit</button>
                  <button onClick={handleDeleteClick} disabled={deleteMutation.isLoading} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"><Trash2 size={16}/> Delete</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  {/* Property Image Display */}
                  {property?.imageUrl && (
                      <div className="bg-light-card rounded-xl border border-border-color shadow-sm overflow-hidden">
                          <img src={property.imageUrl} alt={property.name} className="w-full h-56 object-cover"/>
                      </div>
                  )}
                  {/* Property Info Card */}
                  <div className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm space-y-4">
                      {/* ... property info content remains the same */}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
                    {/* ... tenants list remains the same ... */}
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;
