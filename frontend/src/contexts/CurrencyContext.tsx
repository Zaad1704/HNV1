import React, { createContext, useContext, useState, useEffect } from 'react';
import { useIPLocation } from '../hooks/useIPLocation';

interface CurrencyContextType {
  currency: string;
  currencyCode: string;
  setCurrency: (code: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const currencyMap: Record<string, { symbol: string; code: string }> = {
  'US': { symbol: '$', code: 'USD' },
  'CA': { symbol: 'C$', code: 'CAD' },
  'GB': { symbol: '£', code: 'GBP' },
  'AU': { symbol: 'A$', code: 'AUD' },
  'NZ': { symbol: 'NZ$', code: 'NZD' },
  'EU': { symbol: '€', code: 'EUR' },
  'DE': { symbol: '€', code: 'EUR' },
  'FR': { symbol: '€', code: 'EUR' },
  'ES': { symbol: '€', code: 'EUR' },
  'IT': { symbol: '€', code: 'EUR' },
  'NL': { symbol: '€', code: 'EUR' },
  'JP': { symbol: '¥', code: 'JPY' },
  'CN': { symbol: '¥', code: 'CNY' },
  'IN': { symbol: '₹', code: 'INR' },
  'BD': { symbol: '৳', code: 'BDT' },
  'BR': { symbol: 'R$', code: 'BRL' },
  'MX': { symbol: '$', code: 'MXN' },
  'AR': { symbol: '$', code: 'ARS' },
  'KR': { symbol: '₩', code: 'KRW' },
  'SG': { symbol: 'S$', code: 'SGD' },
  'HK': { symbol: 'HK$', code: 'HKD' },
  'CH': { symbol: 'CHF', code: 'CHF' },
  'SE': { symbol: 'kr', code: 'SEK' },
  'NO': { symbol: 'kr', code: 'NOK' },
  'DK': { symbol: 'kr', code: 'DKK' },
  'RU': { symbol: '₽', code: 'RUB' },
  'ZA': { symbol: 'R', code: 'ZAR' },
  'AE': { symbol: 'د.إ', code: 'AED' },
  'SA': { symbol: 'ر.س', code: 'SAR' },
  'EG': { symbol: 'ج.م', code: 'EGP' },
  'TR': { symbol: '₺', code: 'TRY' },
  'PL': { symbol: 'zł', code: 'PLN' },
  'TH': { symbol: '฿', code: 'THB' },
  'MY': { symbol: 'RM', code: 'MYR' },
  'ID': { symbol: 'Rp', code: 'IDR' },
  'PH': { symbol: '₱', code: 'PHP' },
  'VN': { symbol: '₫', code: 'VND' },
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { location } = useIPLocation();
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [currency, setCurrency] = useState('$');

  useEffect(() => {
    if (location?.countryCode) {
      const savedCurrency = localStorage.getItem('preferredCurrency');
      if (savedCurrency) {
        const currencyData = Object.values(currencyMap).find(c => c.code === savedCurrency);
        if (currencyData) {
          setCurrencyCode(currencyData.code);
          setCurrency(currencyData.symbol);
          return;
        }
      }

      const countryData = currencyMap[location.countryCode] || currencyMap['US'];
      setCurrencyCode(countryData.code);
      setCurrency(countryData.symbol);
    }
  }, [location]);

  const handleSetCurrency = (code: string) => {
    const currencyData = Object.values(currencyMap).find(c => c.code === code);
    if (currencyData) {
      setCurrencyCode(code);
      setCurrency(currencyData.symbol);
      localStorage.setItem('preferredCurrency', code);
    }
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      currencyCode,
      setCurrency: handleSetCurrency
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};