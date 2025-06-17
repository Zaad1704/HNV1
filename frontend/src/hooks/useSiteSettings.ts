import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface ISiteSettings {
    theme: { primaryColor: string; secondaryColor: string; };
    logos: { navbarLogoUrl: string; };
    heroSection: { title: string; subtitle:string; ctaText: string; backgroundImageUrl: string };
    // Define other sections as needed
}

export function useSiteSettings() {
  return useQuery<ISiteSettings, Error>({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/site-settings');
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
