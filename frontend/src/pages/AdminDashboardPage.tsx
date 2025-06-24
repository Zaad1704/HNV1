// frontend/src/pages/AdminDashboardPage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Users, Building, ShieldCheck, BarChart, PieChart } from 'lucide-react';
import PlatformGrowthChart from '../components/admin/charts/PlatformGrowthChart';
import PlanDistributionChart from '../components/admin/charts/PlanDistributionChart';

const fetchAdminStats = async () => { 
    const { data } = await apiClient.get('/super-admin/dashboard-stats');
    return data.data;
};
const fetchPlatformGrowth = async () => { 
    const { data } = await apiClient.get('/super-admin/platform-growth');
    return data.data;
};
const fetchPlanDistribution = async () => { 
    const { data } = await apiClient.get('/super-admin/plan-distribution');
    return data.data;
};

// --- SOLUTION: Redesigned StatCard ---
const StatCard = ({ title, value, icon, color }: { title: string, value: number | string, icon: React.ReactNode, color: string }) => (
    <div className={`bg-brand-secondary p-6 rounded-2xl shadow-lg border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-light-text uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold text-dark-text mt-1">{value}</p>
            </div>
            <div className="text-dark-text opacity-50">
                {icon}
            </div>
        </div>
    </div>
);

const AdminDashboardPage = () => {
    const { data: stats, isLoading: isLoadingStats } = useQuery(['adminDashboardStats'], fetchAdminStats);
    const { data: growthData, isLoading: isLoadingGrowth } = useQuery(['platformGrowth'], fetchPlatformGrowth);
    const { data: planData, isLoading: isLoadingPlans } = useQuery(['planDistribution'], fetchPlanDistribution);
    
    return (
        <div className="text-dark-text space-y-8">
            <h1 className="text-4xl font-bold">Super Admin Dashboard</h1>

            {/* --- SOLUTION: Redesigned Stat Card Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={isLoadingStats ? '...' : stats?.totalUsers ?? 0} icon={<Users className="w-10 h-10" />} color="border-brand-accent-dark" />
                <StatCard title="Total Organizations" value={isLoadingStats ? '...' : stats?.totalOrgs ?? 0} icon={<Building className="w-10 h-10" />} color="border-brand-primary" />
                <StatCard title="Active Subscriptions" value={isLoadingStats ? '...' : stats?.activeSubscriptions ?? 0} icon={<ShieldCheck className="w-10 h-10" />} color="border-green-500" />
            </div>

            {/* --- SOLUTION: Redesigned Chart Layout --- */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-brand-secondary p-6 rounded-2xl shadow-lg border border-border-color">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BarChart size={20} /> Platform Growth (Users vs Orgs)</h2>
                    {isLoadingGrowth ? <p className="text-center py-10 text-light-text">Loading chart data...</p> : <PlatformGrowthChart data={growthData || []} />}
                </div>
                <div className="lg:col-span-2 bg-brand-secondary p-6 rounded-2xl shadow-lg border border-border-color">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><PieChart size={20}/> Active Plan Distribution</h2>
                    {isLoadingPlans ? <p className="text-center py-10 text-light-text">Loading chart data...</p> : <PlanDistributionChart data={planData || []} />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
