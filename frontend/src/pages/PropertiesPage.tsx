import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import AddPropertyModal from '../components/common/AddPropertyModal';

// Placeholder Icons
const AddIcon = () => <span>+</span>;
const ListIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>;
const MapIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 3l6-3m0 0l-6-3m6 3V4"></path></svg>;


const PropertiesPage = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'list' | 'map'>('list'); // State to toggle between list and map

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError('');
        // We add simulated lat/lng for the map view. A real app would store this in the database.
        const response = await apiClient.get('/properties');
        const propertiesWithCoords = response.data.data.map((prop: any) => ({
          ...prop,
          coords: {
            top: `${Math.random() * 80 + 10}%`, // Random top position
            left: `${Math.random() * 80 + 10}%`, // Random left position
          }
        }));
        setProperties(propertiesWithCoords);
      } catch (err) {
        setError('Failed to fetch properties.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handlePropertyAdded = (newProperty: any) => {
    const propertyWithCoords = {
        ...newProperty,
        coords: {
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
        }
    };
    setProperties(prevProperties => [...prevProperties, propertyWithCoords]);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400';
      case 'Under Renovation': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-slate-600/50 text-slate-400';
    }
  };
  
  const ListView = () => (
    <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Property Name</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Address</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Units</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Status</th>
                <th className="p-4 text-sm font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {properties.length > 0 ? (
                properties.map((prop) => (
                  <tr key={prop._id} className="hover:bg-slate-800 transition-colors">
                    <td className="p-4 font-bold text-white">{prop.name}</td>
                    <td className="p-4 text-slate-300">{`${prop.address.street}, ${prop.address.city}`}</td>
                    <td className="p-4 text-slate-300">{prop.numberOfUnits}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(prop.status)}`}>
                        {prop.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="font-medium text-cyan-400 hover:text-cyan-300">Manage</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    You haven't added any properties yet. Click "Add Property" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
  );
  
  const MapView = () => (
    <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700 p-4" style={{ height: '60vh' }}>
        <div className="w-full h-full bg-slate-900 rounded-lg relative overflow-hidden">
            {/* This is a simulated map background. A real implementation would use a map library. */}
            <img src="https://placehold.co/1200x800/1e293b/334155?text=Area+Map" className="w-full h-full object-cover opacity-20" alt="Map background" />
            
            {properties.map(prop => (
                <div 
                    key={prop._id} 
                    className="absolute group"
                    style={{ top: prop.coords.top, left: prop.coords.left }}
                >
                    <div className="w-3 h-3 bg-cyan-400 rounded-full cursor-pointer shadow-lg"></div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block p-2 bg-slate-700 text-white text-xs font-bold rounded-md whitespace-nowrap">
                        {prop.name}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );


  if (loading) return <div className="text-white text-center p-8">Loading properties...</div>;
  if (error) return <div className="text-red-400 text-center p-8">{error}</div>;

  return (
    <div className="text-white">
      <AddPropertyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onPropertyAdded={handlePropertyAdded}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Manage Properties</h1>
        <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1">
                <button onClick={() => setView('list')} className={`p-2 rounded-md ${view === 'list' ? 'bg-cyan-600' : ''}`}><ListIcon /></button>
                <button onClick={() => setView('map')} className={`p-2 rounded-md ${view === 'map' ? 'bg-cyan-600' : ''}`}><MapIcon /></button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
            >
              <AddIcon />
              <span>Add Property</span>
            </button>
        </div>
      </div>

      {view === 'list' ? <ListView /> : <MapView />}
    </div>
  );
};

export default PropertiesPage;
