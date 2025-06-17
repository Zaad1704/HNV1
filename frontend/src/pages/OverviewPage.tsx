import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Building, Users, HandCoins, BarChart2 } from 'lucide-react';

// Define the shape of the data we expect from the API
interface IOverviewStats {
    totalProperties: number;
    activeTenants: number;
    occupancyRate: number;
    monthlyRevenue: number;
}

// Data fetching function for React Query
const fetchOverviewStats = async (): Promise<IOverviewStats> => {
    const { data } = await apiClient.get('/dashboard/overview-stats');
    return data.data;
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, accentColor, formatAsCurrency = false }: any) => (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700 relative overflow-hidden">
        <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-10 ${accentColor}`}></div>
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${accentColor}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase">{title}</h3>
                <p className="text-3xl font-bold text-white mt-1 font-mono">
                    {formatAsCurrency ? `$${Number(value).toLocaleString()}` : value}
                </p>
            </div>
        </div>
    </div>
);

const OverviewPage = () => {
    const { data: stats, isLoading, isError } = useQuery<IOverviewStats>({
        queryKey: ['overviewStats'],
        queryFn: fetchOverviewStats
    });

    if (isLoading) {
        return <div className="text-white text-center p-8">Loading Dashboard...</div>;
    }

    if (isError) {
        return <div className="text-red-400 text-center p-8">Could not load dashboard data. Please try again later.</div>;
    }

    return (
        <div className="text-white">
            <h1 className="text-4xl font-bold mb-8">Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Properties" 
                    value={stats?.totalProperties ?? 0} 
                    icon={<Building className="text-cyan-300" />} 
                    accentColor="bg-cyan-500/50" 
                />
                <StatCard 
                    title="Active Tenants" 
                    value={stats?.activeTenants ?? 0} 
                    icon={<Users className="text-pink-300" />} 
                    accentColor="bg-pink-500/50" 
                />
                <StatCard 
                    title="Occupancy Rate" 
                    value={`${((stats?.occupancyRate ?? 0) * 100).toFixed(0)}%`} 
                    icon={<BarChart2 className="text-emerald-300" />} 
                    accentColor="bg-emerald-500/50" 
                />
                <StatCard 
                    title="This Month's Revenue" 
                    value={stats?.monthlyRevenue ?? 0} 
                    icon={<HandCoins className="text-yellow-300" />} 
                    accentColor="bg-yellow-500/50" 
                    formatAsCurrency={true}
                />
            </div>
            
            <div className="mt-10 bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700">
                <h2 className="text-xl font-bold text-white">Revenue Analytics</h2>
                <div className="mt-4 text-slate-400">
                    <p className="mb-4">This area will display a chart of recent revenue or occupancy trends.</p>
                    {/* A developer would use a library like Recharts here to render a real chart */}
                    <div className="w-full h-64 bg-slate-900/50 rounded-lg flex items-center justify-center border border-dashed border-slate-600">
                        [Chart Placeholder - Now ready for real data]
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;
