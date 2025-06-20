// frontend/src/pages/OverviewPage.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import FinancialSnapshotCard from '../components/dashboard/FinancialSnapshotCard';
import ActionItemWidget from '../components/dashboard/ActionItemWidget';
import { DollarSign, Building2, Users, AlertOctagon, CalendarClock } from 'lucide-react';

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

const OverviewPage = () => {
    const { data: stats, isLoading: isLoadingStats } = useQuery(['overviewStats'], fetchOverviewStats);
    const { data: lateTenants, isLoading: isLoadingLate } = useQuery(['lateTenants'], fetchLateTenants);
    const { data: expiringLeases, isLoading: isLoadingLeases } = useQuery(['expiringLeases'], fetchExpiringLeases);

    if (isLoadingStats || isLoadingLate || isLoadingLeases) {
        return <div className="text-dark-text">Loading Dashboard Data...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-dark-text">Dashboard</h1>

            {/* Financial Snapshots (Wallets) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FinancialSnapshotCard
                    title="Monthly Revenue"
                    value={stats?.monthlyRevenue || 0}
                    currency="$"
                    icon={<DollarSign className="w-8 h-8 text-green-500"/>}
                />
                <FinancialSnapshotCard
                    title="Total Properties"
                    value={stats?.totalProperties || 0}
                    icon={<Building2 className="w-8 h-8 text-blue-500"/>}
                />
                <FinancialSnapshotCard
                    title="Active Tenants"
                    value={stats?.activeTenants || 0}
                    icon={<Users className="w-8 h-8 text-indigo-500"/>}
                />
            </div>

            {/* Action Items (Hot Quests) */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-dark-text">Action Items</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ActionItemWidget
                        title="Overdue Rent Reminders"
                        items={lateTenants?.map(t => ({
                            id: t._id,
                            primaryText: t.name,
                            secondaryText: `Property: ${t.propertyId?.name || 'N/A'}`
                        }))}
                        actionText="View"
                        emptyText="No tenants are currently late on rent."
                        linkTo="/dashboard/payments"
                    />
                    <ActionItemWidget
                        title="Upcoming Lease Expirations"
                        items={expiringLeases?.map(t => ({
                            id: t._id,
                            primaryText: t.name,
                            secondaryText: `Expires on: ${new Date(t.leaseEndDate).toLocaleDateString()}`
                        }))}
                        actionText="Renew"
                        emptyText="No leases are expiring within the next 60 days."
                        linkTo="/dashboard/tenants"
                    />
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;
