// Test IP detection and language mapping
import { detectUserLocation } from '../services/ipService.js';
import { getLanguageByCountry } from './languageConfig.js';

const testIPDetection = async () => {
  console.log('Testing IP-based language detection...');
  
  try {
    const location = await detectUserLocation();
    console.log('Detected location:', location);
    
    if (location?.countryCode) {
      const language = getLanguageByCountry(location.countryCode);
      console.log(`Country: ${location.countryCode} -> Language: ${language.name} (${language.code})`);
      console.log(`Currency: ${language.currency} (${language.currencySymbol})`);
    } else {
      console.log('No country detected, using default English');
    }
  } catch (error) {
    console.error('IP detection failed:', error);
  }
};

// Test country mappings
const testCountryMappings = () => {
  console.log('\nTesting country mappings:');
  const testCountries = ['US', 'CN', 'JP', 'DE', 'FR', 'ES', 'IN', 'BR', 'RU', 'SA'];
  
  testCountries.forEach(country => {
    const language = getLanguageByCountry(country);
    console.log(`${country} -> ${language.name} (${language.code}) ${language.flag}`);
  });
};

testIPDetection();
testCountryMappings();