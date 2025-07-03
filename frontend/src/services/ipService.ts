interface IPResponse {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  currency: string;
  timezone: string;
}

export const detectUserLocation = async (): Promise<IPResponse | null> => {
  try {
    // Try multiple IP detection services for reliability
    const services = [
      'https://ipapi.co/json/',
      'https://api.ipgeolocation.io/ipgeo?apiKey=free',
      'https://ipinfo.io/json'
    ];
    
    for (const service of services) {
      try {
        const response = await fetch(service);
        if (response.ok) {
          const data = await response.json();
          
          // Normalize response format
          return {
            country: data.country_name || data.country || data.country_name,
            countryCode: data.country_code || data.country || data.country_code,
            region: data.region || data.region_name || data.region,
            city: data.city || data.city,
            currency: data.currency || data.currency_code || 'USD',
            timezone: data.timezone || data.time_zone || 'UTC'
          };
        }
      } catch (error) {
        console.warn(`IP service ${service} failed:`, error);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('All IP detection services failed:', error);
    return null;
  }
};