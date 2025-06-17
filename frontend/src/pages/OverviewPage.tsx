import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Building, Users, HandCoins, BarChart2, Bell, TrendingUp } from 'lucide-react';
import ActionableAlerts from '../components/common/ActionableAlerts';
import FinancialChart from '../components/charts/FinancialChart';
import OccupancyChart from '../components/charts/OccupancyChart';
import { useLateTenants } from '../hooks/useLateTenants';

// Data fetching functions
const fetchOverviewStats = async () => {
    const { data } = await apiClient.get('/dashboard/overview-stats');
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

// StatCard Component
const StatCard = ({ title, value, icon, accentColor, formatAsCurrency = false }: any) => (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700 relative overflow-hidden">
        <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-10 ${accentColor}`}></div>
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${accentColor}`}>{icon}</div>
            <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase">{title}</h3>
                <p className="text-3xl font-bold text-white mt-1 font-mono">{formatAsCurrency ? `$${Number(value).toLocaleString('en-US')}` : value}</p>
            </div>
        </div>
    </div>
);


const OverviewPage = () => {
    const { data: stats } = useQuery(['overviewStats'], fetchOverviewStats);
    const { data: lateTenants = [], isLoading: isLoadingTenants } = useLateTenants();
    const { data: financialData, isLoading: isLoadingFinancial } = useQuery(['financialSummary'], fetchFinancialSummary);
    const { data: occupancyData, isLoading: isLoadingOccupancy } = useQuery(['occupancySummary'], fetchOccupancySummary);

    const handleSendReminder = (tenantId: string) => {
        alert(`Simulating sending a rent reminder to tenant ID: ${tenantId}`);
    };

    return (
        <div className="text-white">
            <h1 className="text-4xl font-bold mb-8">Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Properties" value={stats?.totalProperties ?? 0} icon={<Building className="text-cyan-300" />} accentColor="bg-cyan-500/50" />
                <StatCard title="Active Tenants" value={stats?.activeTenants ?? 0} icon={<Users className="text-pink-300" />} accentColor="bg-pink-500/50" />
                <StatCard title="Occupancy Rate" value={`${((stats?.occupancyRate ?? 0) * 100).toFixed(0)}%`} icon={<BarChart2 className="text-emerald-300" />} accentColor="bg-emerald-500/50" />
                <StatCard title="This Month's Revenue" value={stats?.monthlyRevenue ?? 0} icon={<HandCoins className="text-yellow-300" />} accentColor="bg-yellow-500/50" formatAsCurrency={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center"><HandCoins className="mr-2" />12-Month Financial Summary</h2>
                    {isLoadingFinancial ? (
                        <div className="h-80 flex items-center justify-center text-slate-400">Loading Chart...</div>
                    ) : (
                        <FinancialChart data={financialData || []} />
                    )}
                </div>

                <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center"><TrendingUp className="mr-2" />New Tenant Trend (12 Months)</h2>
                    {isLoadingOccupancy ? (
                        <div className="h-80 flex items-center justify-center text-slate-400">Loading Chart...</div>
                    ) : (
                        <OccupancyChart data={occupancyData || []} />
                    )}
                </div>

                <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                     <ActionableAlerts
                        title="Overdue Rent"
                        isLoading={isLoadingTenants}
                        items={lateTenants.map(t => ({ id: t._id, primaryText: t.name, secondaryText: `${t.propertyId.name}, Unit ${t.unit}` }))}
                        onActionClick={handleSendReminder}
                        actionText="Send Reminder"
                    />
                </div>
                
                <div className="bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4">Upcoming Lease Expirations</h2>
                    <div className="h-full flex items-center justify-center text-slate-500">[Content coming soon]</div>
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;
