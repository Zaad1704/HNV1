import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface IExpiringLease {
  _id: string;
  name: string;
  leaseEndDate: string;
}

const fetchExpiringLeases = async (): Promise<IExpiringLease[]> => {
    const { data } = await apiClient.get('/dashboard/expiring-leases');
    return data.data;
};

export function useExpiringLeases() {
  return useQuery<IExpiringLease[], Error>({
    queryKey: ['expiringLeases'],
    queryFn: fetchExpiringLeases,
  });
}
