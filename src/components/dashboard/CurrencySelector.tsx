
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/context/CurrencyContext";
import { SUPPORTED_CURRENCIES } from "@/utils/currencyUtils";
import { useTheme } from "@/context/ThemeContext";

const CurrencySelector = () => {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const { theme } = useTheme();

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    if (currency) {
      setSelectedCurrency(currency);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-gray-400" />
      <Select value={selectedCurrency.code} onValueChange={handleCurrencyChange}>
        <SelectTrigger className={`w-full ${theme === 'light' ? 'bg-white border-gray-300' : 'bg-zue-dark-light border-gray-700 text-white'}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={theme === 'light' ? 'bg-white border-gray-300' : 'bg-zue-dark-light border-gray-700'}>
          {SUPPORTED_CURRENCIES.map((currency) => (
            <SelectItem 
              key={currency.code} 
              value={currency.code}
              className={theme === 'light' ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-zue-dark focus:bg-zue-dark'}
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">{currency.symbol}</span>
                <span>{currency.code}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencySelector;
