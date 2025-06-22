// frontend/src/pages/OverviewPage.tsx

import React, { useState } from 'react'; // Import useState
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Import useMutation
import apiClient from '../api/client';
import FinancialChart from '../components/charts/FinancialChart';
import OccupancyChart from '../components/charts/OccupancyChart';
import ActionItemWidget from '../components/dashboard/ActionItemWidget';
import { DollarSign, Building2, Users } from 'lucide-react';

// API Fetching Functions
const fetchOverviewStats = async () => {
    const { data } = await apiClient.get('/dashboard/overview-stats');
    return data.data;
};
const fetchLateTenants = async () => {
    const { data } = await apiClient.get('/dashboard/late-tenants');
    return data.data;
};
const fetchExpiringLeases = async () => {
    const { data } = await apiClient.get('/dashboard/expiring-leases');
    return data.data;
};
const fetchFinancialSummary = async () => {
    const { data } = await apiClient.get('/dashboard/financial-summary');
    return data.data;
};
const fetchOccupancySummary = async () => {
    const { data } = await apiClient.get('/dashboard/occupancy-summary');
    return data.data;
};

// NEW: Mutation function for sending rent reminders
const sendRentReminder = async (tenantId: string) => {
    const { data } = await apiClient.post('/communication/send-rent-reminder', { tenantId });
    return data.message;
};


const StatCard = ({ title, value, icon, currency = '' }) => (
    <div className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-light-text">{title}</p>
            <p className="text-3xl font-bold text-dark-text mt-2">
                {currency}{typeof value === 'number' ? value.toLocaleString() : value}
            </p>
        </div>
        <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-lg">
            {icon}
        </div>
    </div>
);

const OverviewPage = () => {
    const queryClient = useQueryClient(); // NEW: Get queryClient
    const { data: stats, isLoading: isLoadingStats } = useQuery({ queryKey: ['overviewStats'], queryFn: fetchOverviewStats });
    const { data: lateTenants, isLoading: isLoadingLate } = useQuery({ queryKey: ['lateTenants'], queryFn: fetchLateTenants });
    const { data: expiringLeases, isLoading: isLoadingLeases } = useQuery({ queryKey: ['expiringLeases'], queryFn: fetchExpiringLeases });
    const { data: financialData, isLoading: isLoadingFinancial } = useQuery({ queryKey: ['financialSummary'], queryFn: fetchFinancialSummary });
    const { data: occupancyData, isLoading: isLoadingOccupancy } = useQuery({ queryKey: ['occupancySummary'], queryFn: fetchOccupancySummary });

    // NEW: State for tracking reminder sending
    const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

    // NEW: Mutation for sending reminders
    const reminderMutation = useMutation({
        mutationFn: sendRentReminder,
        onMutate: (tenantId) => {
            setSendingReminderId(tenantId); // Set which item is currently sending
        },
        onSuccess: (message, tenantId) => {
            alert(message); // Show success message
            // Optionally, invalidate queries if you want to refresh the late tenants list
            // queryClient.invalidateQueries({ queryKey: ['lateTenants'] }); 
        },
        onError: (err: any) => {
            alert(`Failed to send reminder: ${err.response?.data?.message || err.message}`);
        },
        onSettled: () => {
            setSendingReminderId(null); // Reset sending state regardless of success/failure
        },
    });

    // Handler function for ActionItemWidget's "Send Reminder" button
    const handleSendReminder = (tenantId: string) => {
        if (window.confirm('Are you sure you want to send a rent reminder email to this tenant?')) {
            reminderMutation.mutate(tenantId);
        }
    };


    const isLoading = isLoadingStats || isLoadingLate || isLoadingLeases || isLoadingFinancial || isLoadingOccupancy;

    if (isLoading) {
        return <div className="text-dark-text text-center p-8">Loading Dashboard Data...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-dark-text">Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Monthly Revenue" value={stats?.monthlyRevenue || 0} currency="$" icon={<DollarSign className="w-6 h-6"/>} />
                <StatCard title="Total Properties" value={stats?.totalProperties || 0} icon={<Building2 className="w-6 h-6"/>} />
                <StatCard title="Active Tenants" value={stats?.activeTenants || 0} icon={<Users className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
                    <h2 className="text-xl font-bold text-dark-text mb-4">Financials (Last 6 Months)</h2>
                    <FinancialChart data={financialData || []} />
                </div>
                <div className="lg:col-span-2 bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
                    <h2 className="text-xl font-bold text-dark-text mb-4">Occupancy Growth</h2>
                    <OccupancyChart data={occupancyData || []} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <ActionItemWidget
                    title="Overdue Rent Reminders"
                    items={lateTenants?.map(t => ({ id: t._id, primaryText: t.name, secondaryText: `Property: ${t.propertyId?.name || 'N/A'}` }))}
                    actionText="Send Reminder"
                    linkTo="/dashboard/tenants" // This is the fallback link
                    onActionClick={handleSendReminder} // NEW: Pass the handler function
                    isActionLoading={reminderMutation.isLoading} // NEW: Pass loading state
                    loadingItemId={sendingReminderId} // NEW: Pass current item being sent
                />
                <ActionItemWidget
                    title="Upcoming Lease Expirations"
                    items={expiringLeases?.map(t => ({ id: t._id, primaryText: t.name, secondaryText: `Expires on: ${new Date(t.leaseEndDate).toLocaleDateString()}` }))}
                    actionText="Renew Lease"
                    linkTo="/dashboard/tenants"
                />
            </div>
        </div>
    );
};

export default OverviewPage;
