import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Users, Building, ShieldCheck } from 'lucide-react';
import PlatformGrowthChart from '../components/admin/charts/PlatformGrowthChart';
import PlanDistributionChart from '../components/admin/charts/PlanDistributionChart';

const fetchAdminStats = async () => { /* ... */ };
const fetchOrganizations = async () => { /* ... */ };
const fetchPlatformGrowth = async () => { /* ... */ };
const fetchPlanDistribution = async () => { /* ... */ };

const StatCard = ({ title, value, icon }: { title: string, value: number | string, icon: React.ReactNode }) => (
    <div className="bg-light-card p-6 rounded-xl shadow-sm border border-border-color">
        <div className="flex items-center">
            <div className="mr-4 text-brand-orange">{icon}</div>
            <div>
                <p className="text-sm font-medium text-light-text">{title}</p>
                <p className="text-2xl font-bold text-dark-text">{value}</p>
            </div>
        </div>
    </div>
);

const AdminDashboardPage = () => {
    const { data: stats, isLoading: isLoadingStats } = useQuery(['adminDashboardStats'], fetchAdminStats);
    const { data: organizations = [], isLoading: isLoadingOrgs } = useQuery(['allOrganizations'], fetchOrganizations);
    const { data: growthData, isLoading: isLoadingGrowth } = useQuery(['platformGrowth'], fetchPlatformGrowth);
    const { data: planData, isLoading: isLoadingPlans } = useQuery(['planDistribution'], fetchPlanDistribution);
    
    return (
        <div className="text-dark-text space-y-8">
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={isLoadingStats ? '...' : stats?.totalUsers ?? 0} icon={<Users className="w-8 h-8" />} />
                <StatCard title="Total Organizations" value={isLoadingStats ? '...' : stats?.totalOrgs ?? 0} icon={<Building className="w-8 h-8" />} />
                <StatCard title="Active Subscriptions" value={isLoadingStats ? '...' : stats?.activeSubscriptions ?? 0} icon={<ShieldCheck className="w-8 h-8" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-light-card border border-border-color p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Platform Growth (Last 12 Months)</h2>
                    {isLoadingGrowth ? <p>Loading chart data...</p> : <PlatformGrowthChart data={growthData || []} />}
                </div>
                <div className="lg:col-span-2 bg-light-card border border-border-color p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Active Plan Distribution</h2>
                    {isLoadingPlans ? <p>Loading chart data...</p> : <PlanDistributionChart data={planData || []} />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
