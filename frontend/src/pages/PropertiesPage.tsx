// frontend/src/pages/PropertiesPage.tsx
import React, { useState } from 'react';
import apiClient from '../api/client';
import AddPropertyModal from '../components/common/AddPropertyModal';
import { useWindowSize } from '../hooks/useWindowSize';
import { Home, MapPin, SquareActivity } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Import useQuery and useQueryClient

// Define fetch function for React Query
const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data; // Assuming data.data contains the array of properties
};

const PropertiesPage = () => {
  // const [properties, setProperties] = useState<any[]>([]); // This state is now managed by useQuery
  // const [loading, setLoading] = useState(true); // This state is now managed by useQuery
  const queryClient = useQueryClient(); // Get query client instance for invalidation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { width } = useWindowSize();

  // Use useQuery for data fetching
  const { data: properties = [], isLoading, isError } = useQuery({
      queryKey: ['properties'], // Unique key for this query
      queryFn: fetchProperties, // The async function to fetch data
      staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const handlePropertyAdded = (newProperty: any) => {
    // Instead of directly updating state, invalidate the query to refetch latest data
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    // You could also optimistically update the cache:
    /*
    queryClient.setQueryData(['properties'], (old: any) => [...(old || []), newProperty]);
    */
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Under Renovation': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Desktop Table View
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
                <th className="p-4 text-sm font-semibold text-light-text uppercase">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
            {properties.map((prop: any) => ( // Cast to any because TS might not infer fully from query data
                <tr key={prop._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-dark-text">{prop.name}</td>
                    <td className="p-4 text-light-text">{prop.address.formattedAddress}</td>
                    <td className="p-4 text-light-text">{prop.numberOfUnits}</td>
                    <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(prop.status)}`}>{prop.status}</span></td>
                    <td className="p-4"><button className="font-medium text-brand-primary hover:underline">Manage</button></td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
  );

  // Mobile Card View for properties
  const MobileView = () => (
    <div className="grid grid-cols-1 gap-4">
        {properties.map((prop: any) => ( // Cast to any
            <div key={prop._id} className="bg-light-card p-4 rounded-xl border border-border-color shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-dark-text text-lg">{prop.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(prop.status)}`}>
                        {prop.status}
                    </span>
                </div>
                <p className="text-light-text text-sm flex items-center gap-2 mb-1"><MapPin size={14}/> {prop.address.formattedAddress}</p>
                <p className="text-light-text text-sm flex items-center gap-2 mb-1"><Home size={14}/> {prop.numberOfUnits} Units</p>
                <div className="flex justify-end mt-4">
                    <button className="font-medium text-sm text-brand-primary hover:underline">
                        View Details
                    </button>
                </div>
            </div>
        ))}
    </div>
  );

  if (isLoading) return <div className="text-center p-8">Loading properties...</div>;
  if (isError) return <div className="text-red-500 text-center p-8">Failed to fetch properties.</div>;

  return (
    <div>
      <AddPropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPropertyAdded={handlePropertyAdded}
      />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-dark-text">Manage Properties</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-bold rounded-lg shadow-md transition-colors"
        >
          <span>+ Add Property</span>
        </button>
      </div>

       {properties.length === 0 ? (
            <div className="text-center py-16 bg-light-card rounded-xl border border-dashed">
                <h3 className="text-xl font-semibold text-dark-text">No Properties Found</h3>
                <p className="text-light-text mt-2 mb-4">Get started by adding your first property.</p>
                <button onClick={() => setIsModalOpen(true)} className="text-sm font-semibold text-brand-primary hover:underline">
                    + Add Your First Property
                </button>
            </div>
       ) : (
            width < 768 ? <MobileView /> : <DesktopView />
       )}
    </div>
  );
};

export default PropertiesPage;
