import React, { useState, useMemo } from 'react';
import apiClient from '../api/client';
import AddTenantModal from '../components/common/AddTenantModal';
// ... other imports
import { Plus, ClipboardList, Edit, Eye, Trash2, Search, Download } from 'lucide-react'; // Add Download icon

const fetchTenants = async () => { /* ... */ };
// NEW: Fetch properties for the filter dropdown
const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data;
};

// ... EditTenantModal component remains the same

const TenantsPage = () => {
    const navigate = useNavigate();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<ITenant | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();
    
    // NEW: State for the property filter
    const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('');

    const { data: tenants = [], isLoading, isError } = useQuery({ queryKey: ['tenants'], queryFn: fetchTenants });
    // NEW: Query to get properties for the filter
    const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });

    const deleteMutation = useMutation({ /* ... */ });
    const handleDeleteClick = (tenantId: string) => { /* ... */ };
    const filteredTenants = useMemo(() => { /* ... */ }, [searchTerm, tenants]);
    const getStatusBadge = (status: string) => { /* ... */ };

    // --- NEW: Function to handle the CSV export ---
    const handleExport = async () => {
        try {
            const response = await apiClient.get('/reports/tenants/export', {
                params: {
                    // Pass the selected propertyId if it's not 'all'
                    propertyId: selectedPropertyFilter === 'all' ? '' : selectedPropertyFilter
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'tenants-export.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);

        } catch (error) {
            console.error("Failed to export tenants:", error);
            alert("Could not export tenants.");
        }
    };
    
    const DesktopView = () => ( /* ... no change ... */ );
  
    if (isLoading) return <div className="text-center p-8">Loading tenants...</div>;
    if (isError) return <div className="text-red-500 text-center p-8">Failed to fetch tenants.</div>;

    return (
        <div>
            {/* ... modals ... */}

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-dark-text">Manage Tenants</h1>
                <div className="flex items-center gap-2">
                    {/* NEW: Download Button */}
                    <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"><Download size={18} /><span>Export CSV</span></button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-brand-primary text-white font-bold rounded-lg"><Plus size={18} /><span>Add Tenant</span></button>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text" size={20} />
                    <input type="text" placeholder="Search by name, email, or unit..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-light-card border border-border-color rounded-lg" />
                </div>
                {/* NEW: Property Filter Dropdown */}
                <div className="flex-shrink-0">
                    <select
                        value={selectedPropertyFilter}
                        onChange={(e) => setSelectedPropertyFilter(e.target.value)}
                        className="w-full sm:w-64 h-full px-4 py-3 bg-light-card border border-border-color rounded-lg text-dark-text"
                    >
                        <option value="all">All Properties</option>
                        {properties.map(prop => (
                            <option key={prop._id} value={prop._id}>{prop.name}</option>
                        ))}
                    </select>
                </div>
            </div>
      
            {filteredTenants.length > 0 ? <DesktopView /> : ( /* ... */ )}
        </div>
    );
};

export default TenantsPage;
