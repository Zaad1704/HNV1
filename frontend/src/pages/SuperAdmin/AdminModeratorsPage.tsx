import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Plus, Edit, ShieldCheck } from 'lucide-react';
import ModeratorFormModal from '../../components/admin/ModeratorFormModal';

// React Query function to fetch moderators
const fetchModerators = async () => {
    const { data } = await apiClient.get('/super-admin/moderators');
    return data.data;
};

const AdminModeratorsPage = () => {
    const queryClient = useQueryClient();
    const { data: moderators = [], isLoading, isError } = useQuery({
        queryKey: ['moderators'],
        queryFn: fetchModerators
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedModerator, setSelectedModerator] = useState(null);

    const handleAddNew = () => {
        setSelectedModerator(null);
        setIsModalOpen(true);
    };

    const handleEdit = (moderator: any) => {
        setSelectedModerator(moderator);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedModerator(null);
        // This refetches the moderator list to show any changes
        queryClient.invalidateQueries({ queryKey: ['moderators'] });
    }

    if (isLoading) return <div className="text-center p-8">Loading Moderators...</div>;
    if (isError) return <div className="text-center text-red-500 p-8">Failed to fetch moderators.</div>;

    return (
        <div className="text-gray-800">
            {isModalOpen && (
                <ModeratorFormModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    moderator={selectedModerator}
                />
            )}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Moderators</h1>
                <button 
                    onClick={handleAddNew} 
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Moderator
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-3 font-semibold">Name</th>
                            <th className="text-left p-3 font-semibold">Email</th>
                            <th className="text-left p-3 font-semibold">Permissions</th>
                            <th className="text-left p-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {moderators.map((mod: any) => (
                            <tr key={mod._id}>
                                <td className="p-3 font-medium">{mod.name}</td>
                                <td className="p-3">{mod.email}</td>
                                <td className="p-3 text-sm text-gray-600">
                                    {mod.permissions.length > 0 ? mod.permissions.join(', ') : 'None'}
                                </td>
                                <td className="p-3">
                                    <button onClick={() => handleEdit(mod)} className="text-indigo-600 hover:text-indigo-800">
                                        <Edit size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {moderators.length === 0 && (
                    <div className="text-center p-8 text-gray-500">
                        No moderators have been created yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminModeratorsPage;
