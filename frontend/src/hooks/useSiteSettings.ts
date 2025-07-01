import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/site-settings');
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};