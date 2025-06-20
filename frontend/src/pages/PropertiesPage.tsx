// frontend/src/pages/PropertiesPage.tsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import AddPropertyModal from '../components/common/AddPropertyModal';
import { useDynamicTranslation } from '../hooks/useDynamicTranslation';

const ListIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>;
const MapIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 3l6-3m0 0l-6-3m6 3V4"></path></svg>;

const TranslatedCell = ({ text }: { text: string }) => {
    const { translatedText, isLoading } = useDynamicTranslation(text);
    if (isLoading) return <span className="text-gray-400 italic">...</span>;
    return <>{translatedText}</>;
};

const PropertiesPage = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'list' | 'map'>('list');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiClient.get('/properties');
        setProperties(response.data.data);
      } catch (err) {
        setError('Failed to fetch properties.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handlePropertyAdded = (newProperty: any) => {
    setProperties(prevProperties => [...prevProperties, newProperty]);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Under Renovation': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ListView = () => (
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
              {properties.map((prop) => (
                  <tr key={prop._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-dark-text"><TranslatedCell text={prop.name} /></td>
                    <td className="p-4 text-light-text"><TranslatedCell text={prop.address.formattedAddress || `${prop.address.street}, ${prop.address.city}`} /></td>
                    <td className="p-4 text-light-text">{prop.numberOfUnits}</td>
                    <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(prop.status)}`}>{prop.status}</span></td>
                    <td className="p-4"><button className="font-medium text-brand-orange hover:opacity-80">Manage</button></td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
  
  const MobileCardView = () => (
    <div className="space-y-4">
        {properties.map(prop => (
            <div key={prop._id} className="bg-light-card p-4 rounded-xl border border-border-color shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-dark-text"><TranslatedCell text={prop.name} /></h3>
                        <p className="text-sm text-light-text mt-1"><TranslatedCell text={prop.address.formattedAddress} /></p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(prop.status)}`}>{prop.status}</span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-color">
                    <p className="text-sm text-light-text">{prop.numberOfUnits} Units</p>
                    <button className="font-semibold text-sm bg-brand-orange/10 text-brand-orange py-1.5 px-4 rounded-lg">Manage</button>
                </div>
            </div>
        ))}
    </div>
  );

  if (loading) return <div className="text-center p-8">Loading properties...</div>;
  if (error) return (
    <div className="text-center p-8 bg-light-card rounded-xl">
        <h2 className="text-xl font-bold text-dark-text">Error</h2>
        <p className="text-light-text mt-2 mb-4">{error}</p>
    </div>
  );
    if (!properties || properties.length === 0) return (
        <div className="text-center p-8 bg-light-card rounded-xl">
            <h2 className="text-xl font-bold text-dark-text">No Properties Found</h2>
            <p className="text-light-text mt-2 mb-4">Get started by adding your first property.</p>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 px-5 py-2.5 bg-brand-orange hover:opacity-90 text-white font-bold rounded-lg shadow-sm mx-auto">
              <span>+ Add Your First Property</span>
            </button>
        </div>
    );

  return (
    <div>
      <AddPropertyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onPropertyAdded={handlePropertyAdded}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-dark-text">Manage Properties</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-brand-orange hover:opacity-90 text-white font-bold rounded-lg shadow-sm"
        >
          <span>+ Add Property</span>
        </button>
      </div>
      
      <div className="hidden md:block"> <ListView /> </div>
      <div className="block md:hidden"> <MobileCardView /> </div>
    </div>
  );
};

export default PropertiesPage;
