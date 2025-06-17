import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface IAdminStats {
    totalUsers: number;
    totalOrgs: number;
    activeSubscriptions: number;
}

const fetchAdminStats = async (): Promise<IAdminStats> => {
    const { data } = await apiClient.get('/super-admin/dashboard-stats');
    return data.data;
};

export function useAdminDashboardStats() {
    return useQuery<IAdminStats, Error>(['adminDashboardStats'], fetchAdminStats);
}
