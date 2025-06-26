import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface IExpiringLease {
  _id: string;
  name: string;
  leaseEndDate: string;
  propertyId: {
    name: string;
  };
}

export const useExpiringLeases = () => {
  return useQuery({
    queryKey: ['expiringLeases'],
    queryFn: async (): Promise<IExpiringLease[]> => {
      const { data } = await apiClient.get('/dashboard/expiring-leases');
      return data.data;
    },
  });
};
