import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ISiteSettings } from '../../../backend/models/SiteSettings'; // Assuming you can share types

// If you can't share types from backend, redefine the interface here
// export interface ISiteSettings { ... }

export function useSiteSettings() {
  return useQuery<ISiteSettings, Error>({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/site-settings');
      // Return a default object if no settings are found yet to prevent errors
      return data.data || {};
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
