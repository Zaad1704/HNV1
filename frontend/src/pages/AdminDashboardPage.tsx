import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Users, Building, ShieldCheck } from 'lucide-react';
import PlatformGrowthChart from '../components/admin/charts/PlatformGrowthChart';
import PlanDistributionChart from '../components/admin/charts/PlanDistributionChart';

// Data Fetching Functions
const fetchAdminStats = async () => {
    const { data } = await apiClient.get('/super-admin/dashboard-stats');
    return data.data;
};
const fetchOrganizations = async () => {
    const { data } = await apiClient.get('/super-admin/organizations');
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

// StatCard Component
const StatCard = ({ title, value, icon }: { title: string, value: number | string, icon: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center">
            <div className="mr-4">{icon}</div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
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
        <div className="text-gray-800 space-y-8">
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={isLoadingStats ? '...' : stats?.totalUsers ?? 0} icon={<Users className="w-8 h-8 text-blue-500" />} />
                <StatCard title="Total Organizations" value={isLoadingStats ? '...' : stats?.totalOrgs ?? 0} icon={<Building className="w-8 h-8 text-green-500" />} />
                <StatCard title="Active Subscriptions" value={isLoadingStats ? '...' : stats?.activeSubscriptions ?? 0} icon={<ShieldCheck className="w-8 h-8 text-indigo-500" />} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold mb-4">Platform Growth (Last 12 Months)</h2>
                    {isLoadingGrowth ? <p>Loading chart data...</p> : <PlatformGrowthChart data={growthData || []} />}
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold mb-4">Active Plan Distribution</h2>
                    {isLoadingPlans ? <p>Loading chart data...</p> : <PlanDistributionChart data={planData || []} />}
                </div>
            </div>

            {/* Organizations Table */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-4">All Organizations</h2>
                <div className="overflow-x-auto">
                    {isLoadingOrgs ? (
                        <p>Loading organizations...</p>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 font-semibold text-gray-600">Organization Name</th>
                                    <th className="p-3 font-semibold text-gray-600">Owner</th>
                                    <th className="p-3 font-semibold text-gray-600">Plan</th>
                                    <th className="p-3 font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {organizations.map((org: any) => (
                                    <tr key={org.id} className="border-b">
                                        <td className="p-3 font-semibold">{org.name}</td>
                                        <td className="p-3 text-gray-600">{org.owner?.email || 'N/A'}</td>
                                        <td className="p-3 text-gray-600">{org.plan || 'N/A'}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {org.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
