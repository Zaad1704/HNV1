import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

// This interface should match the one in your SiteSettings.ts backend model
export interface ISiteSettings {
    theme: { primaryColor: string; secondaryColor: string; };
    logos: { navbarLogoUrl: string; };
    heroSection: { title: string; subtitle:string; ctaText: string; backgroundImageUrl: string };
    featuresSection: { title: string; subtitle: string; feature1Title: string; /* ...and so on */ };
}

export function useSiteSettings() {
  return useQuery<ISiteSettings, Error>({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/site-settings');
      return data.data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
