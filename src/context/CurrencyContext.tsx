
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Currency, SUPPORTED_CURRENCIES } from '@/utils/currencyUtils';

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    // Load from localStorage or default to USD
    const saved = localStorage.getItem('selectedCurrency');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return SUPPORTED_CURRENCIES.find(c => c.code === parsed.code) || SUPPORTED_CURRENCIES[0];
      } catch {
        return SUPPORTED_CURRENCIES[0];
      }
    }
    return SUPPORTED_CURRENCIES[0];
  });

  useEffect(() => {
    localStorage.setItem('selectedCurrency', JSON.stringify(selectedCurrency));
  }, [selectedCurrency]);

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
