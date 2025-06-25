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

    if (isLoading) return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading Moderators...</div>;
    if (isError) return <div className="text-center text-red-500 p-8 dark:text-red-500">Failed to fetch moderators.</div>;

    return (
        <div className="text-dark-text dark:text-dark-text-dark">
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
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary transition-colors"
                >
                    <Plus size={20} />
                    Add Moderator
                </button>
            </div>
            
            <div className="bg-light-card p-6 rounded-lg shadow-md overflow-x-auto dark:bg-dark-card border border-border-color dark:border-border-color-dark">
                <table className="w-full">
                    <thead className="bg-light-bg dark:bg-dark-bg/50">
                        <tr>
                            <th className="text-left p-3 font-semibold text-light-text dark:text-light-text-dark">Name</th>
                            <th className="text-left p-3 font-semibold text-light-text dark:text-light-text-dark">Email</th>
                            <th className="text-left p-3 font-semibold text-light-text dark:text-light-text-dark">Permissions</th>
                            <th className="text-left p-3 font-semibold text-light-text dark:text-light-text-dark">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
                        {moderators.map((mod: any) => (
                            <tr key={mod._id} className="hover:bg-light-bg transition-colors duration-150 dark:hover:bg-dark-bg/40">
                                <td className="p-3 font-medium">{mod.name}</td>
                                <td className="p-3">{mod.email}</td>
                                <td className="p-3 text-sm text-light-text dark:text-light-text-dark">
                                    {mod.permissions.length > 0 ? mod.permissions.join(', ') : 'None'}
                                </td>
                                <td className="p-3">
                                    <button onClick={() => handleEdit(mod)} className="text-brand-primary dark:text-brand-secondary hover:text-brand-accent-dark">
                                        <Edit size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {moderators.length === 0 && (
                    <div className="text-center p-8 text-light-text dark:text-light-text-dark">
                        No moderators have been created yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminModeratorsPage;
