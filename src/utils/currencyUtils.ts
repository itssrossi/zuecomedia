
export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
];

// Exchange rates relative to ZAR (South African Rand is the base currency)
const EXCHANGE_RATES: Record<string, number> = {
  ZAR: 1,        // Base currency
  USD: 0.055,    // 1 ZAR = 0.055 USD
  EUR: 0.051,    // 1 ZAR = 0.051 EUR
  GBP: 0.044,    // 1 ZAR = 0.044 GBP
  CAD: 0.075,    // 1 ZAR = 0.075 CAD
  AUD: 0.083,    // 1 ZAR = 0.083 AUD
  JPY: 8.2,      // 1 ZAR = 8.2 JPY
  CHF: 0.049,    // 1 ZAR = 0.049 CHF
  CNY: 0.40,     // 1 ZAR = 0.40 CNY
  INR: 4.6       // 1 ZAR = 4.6 INR
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Since ZAR is our base currency, convert from ZAR to target currency
  if (fromCurrency === 'ZAR') {
    return amount * EXCHANGE_RATES[toCurrency];
  }
  
  // If converting from another currency to ZAR
  if (toCurrency === 'ZAR') {
    return amount / EXCHANGE_RATES[fromCurrency];
  }
  
  // Convert from one non-ZAR currency to another via ZAR
  const zarAmount = amount / EXCHANGE_RATES[fromCurrency];
  return zarAmount * EXCHANGE_RATES[toCurrency];
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  if (!currency) return `R${amount.toLocaleString()}`;
  
  // For JPY, don't show decimal places
  const decimals = currencyCode === 'JPY' ? 0 : 2;
  
  return `${currency.symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
};
