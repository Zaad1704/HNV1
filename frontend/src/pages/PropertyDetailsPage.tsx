import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ChevronLeft, MapPin, Home, Users } from 'lucide-react';
import { ITenant } from './TenantsPage'; // Assuming ITenant is exported from TenantsPage

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

    if (!propertyId) {
        return <div className="text-red-500 text-center p-8">Invalid property ID.</div>;
    }

    // Query for the specific property
    const { data: property, isLoading: isLoadingProperty, isError: isErrorProperty } = useQuery({
        queryKey: ['propertyDetails', propertyId],
        queryFn: () => fetchPropertyDetails(propertyId),
    });

    // Query for tenants and then filter them
    const { data: tenants = [], isLoading: isLoadingTenants } = useQuery<ITenant[], Error>({
        queryKey: ['tenants'], // Reuse existing tenants query if possible
        queryFn: fetchTenantsForProperty,
    });

    const propertyTenants = tenants.filter(tenant => tenant.propertyId?._id === propertyId);

    if (isLoadingProperty || isLoadingTenants) {
        return <div className="text-center p-8">Loading property details...</div>;
    }
    if (isErrorProperty) {
        return <div className="text-red-500 text-center p-8">Failed to load property details.</div>;
    }

    return (
        <div className="text-dark-text">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/dashboard/properties" className="text-light-text hover:text-brand-primary" title="Back to Properties">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold">{property?.name || 'Property Details'}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Property Info */}
                <div className="lg:col-span-1 bg-light-card p-6 rounded-xl border border-border-color shadow-sm space-y-4">
                    <div>
                        <h2 className="text-xl font-bold mb-4">Information</h2>
                        <p className="flex items-center gap-2 text-light-text"><MapPin size={16} /> {property?.address?.formattedAddress || 'No address'}</p>
                        <p className="flex items-center gap-2 text-light-text mt-2"><Home size={16} /> {property?.numberOfUnits || 0} Units</p>
                    </div>
                     <div>
                        <h3 className="font-semibold mt-4">Status</h3>
                        <p className={`px-2 py-1 text-xs font-semibold rounded-full inline-block mt-1 ${property?.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            {property?.status || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Right Column: Tenants List */}
                <div className="lg:col-span-2 bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users size={20}/> Tenants in this Property</h2>
                    {propertyTenants.length > 0 ? (
                        <ul className="divide-y divide-border-color">
                            {propertyTenants.map(tenant => (
                                <li key={tenant._id} className="py-3">
                                    <p className="font-semibold text-dark-text">{tenant.name}</p>
                                    <p className="text-sm text-light-text">Unit: {tenant.unit} - Status: {tenant.status}</p>
                                    <p className="text-sm text-light-text">{tenant.email}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-light-text text-center py-8">No tenants are currently assigned to this property.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;
