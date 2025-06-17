import React, { useState } from 'react'; // <-- Import useState
import { useQuery } from '@tanstack/react-query';
// ... other imports
import MaintenanceRequestModal from '../components/common/MaintenanceRequestModal'; // <-- IMPORT NEW MODAL

// ... (interfaces, fetch function)

const TenantDashboardPage = () => {
    const { data, isLoading, isError, error } = useQuery<TenantDashboardData, Error>({ /* ... */ });
    const [isModalOpen, setIsModalOpen] = useState(false); // <-- NEW STATE FOR MODAL

    if (isLoading) { /* ... */ }
    if (isError) { /* ... */ }

    return (
        <div className="text-white space-y-8">
            {/* NEW: Render the modal */}
            <MaintenanceRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <h1 className="text-4xl font-bold">My Tenant Dashboard</h1>

            {/* ... (Lease & Property Info Card) ... */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ... (Payment History Card) ... */}

                {/* Actions & Requests */}
                <div className="space-y-6">
                    <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                         <h2 className="text-xl font-bold text-pink-400 mb-3 flex items-center"><Wrench className="mr-2" />Submit a Maintenance Request</h2>
                         <p className="text-slate-400 mb-4">Have an issue in your unit? Let us know.</p>
                         {/* UPDATE THIS BUTTON to open the modal */}
                         <button onClick={() => setIsModalOpen(true)} className="w-full px-5 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-500">
                            Create Request
                         </button>
                    </div>
                     {/* ... (Emergency Contact Card) ... */}
                </div>
            </div>
        </div>
    );
};

export default TenantDashboardPage;
