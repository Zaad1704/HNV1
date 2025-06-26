import { useQuery } from '@tanstack/react-query';

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyResponse {
  base_code: string;
  conversion_rates: ExchangeRates;
}

const EXCHANGE_API_KEY = 'your-api-key'; // Replace with actual API key
const BASE_CURRENCY = 'USD';

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`);
    const data: CurrencyResponse = await response.json();
    return data.rates || data.conversion_rates;
  } catch (error) {
    console.warn('Failed to fetch exchange rates, using fallback rates');
    // Fallback rates
    return {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      CAD: 1.25,
      AUD: 1.35,
      JPY: 110,
      CHF: 0.92,
      CNY: 6.45,
      INR: 74.5,
      BRL: 5.2
    };
  }
};

export const useCurrencyRates = () => {
  return useQuery({
    queryKey: ['exchangeRates'],
    queryFn: fetchExchangeRates,
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export const convertPrice = (price: number, fromCurrency: string, toCurrency: string, rates: ExchangeRates): number => {
  if (fromCurrency === toCurrency) return price;
  
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const usdPrice = price / fromRate;
  return usdPrice * toRate;
};

export const formatCurrency = (amount: number, currency: string): string => {
  const symbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF '
  };

  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${amount.toFixed(2)}`;
};