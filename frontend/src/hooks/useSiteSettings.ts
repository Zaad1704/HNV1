import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
// FIX: Import the type from the new local file, not from the backend directory.
import { ISiteSettings } from '../types/siteSettings';

export function useSiteSettings() {
  return useQuery<ISiteSettings, Error>({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/site-settings');
      return data.data || {};
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
