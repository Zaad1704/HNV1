import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import FinancialChart from '../components/charts/FinancialChart';
import OccupancyChart from '../components/charts/OccupancyChart';
import { DollarSign, Building2, Users, AlertOctagon, CalendarClock } from 'lucide-react';

// --- API Fetching Functions ---
const fetchOverviewStats = async () => {
    const { data } = await apiClient.get('/dashboard/overview-stats');
    return data.data;
};

// --- Mock Data for Charts (replace with real API calls later) ---
const financialData = [
  { name: 'Jan', Revenue: 4000, Expenses: 2400 },
  { name: 'Feb', Revenue: 3000, Expenses: 1398 },
  { name: 'Mar', Revenue: 5000, Expenses: 3800 },
  { name: 'Apr', Revenue: 4780, Expenses: 3908 },
  { name: 'May', Revenue: 5890, Expenses: 4800 },
  { name: 'Jun', Revenue: 4390, Expenses: 3800 },
];
const occupancyData = [
  { name: 'Jan', "New Tenants": 2 },
  { name: 'Feb', "New Tenants": 3 },
  { name: 'Mar', "New Tenants": 1 },
  { name: 'Apr', "New Tenants": 4 },
  { name: 'May', "New Tenants": 3 },
  { name: 'Jun', "New Tenants": 5 },
];


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
    const { data: stats, isLoading: isLoadingStats } = useQuery(['overviewStats'], fetchOverviewStats);

    if (isLoadingStats) {
        return <div className="text-dark-text">Loading Dashboard Data...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-dark-text">Overview</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Monthly Revenue" value={stats?.monthlyRevenue || 0} currency="$" icon={<DollarSign className="w-6 h-6"/>} />
                <StatCard title="Total Properties" value={stats?.totalProperties || 0} icon={<Building2 className="w-6 h-6"/>} />
                <StatCard title="Active Tenants" value={stats?.activeTenants || 0} icon={<Users className="w-6 h-6"/>} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
                    <h2 className="text-xl font-bold text-dark-text mb-4">Financials (Last 6 Months)</h2>
                    <FinancialChart data={financialData} />
                </div>
                <div className="bg-light-card p-6 rounded-xl border border-border-color shadow-sm">
                    <h2 className="text-xl font-bold text-dark-text mb-4">Occupancy Growth</h2>
                    <OccupancyChart data={occupancyData} />
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;
