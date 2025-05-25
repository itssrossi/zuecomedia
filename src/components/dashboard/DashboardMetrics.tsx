
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileText
} from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import CampaignTrendChart from "@/components/dashboard/CampaignTrendChart";
import MetricPieChart from "@/components/dashboard/MetricPieChart";
import { useCurrency } from "@/context/CurrencyContext";
import { convertCurrency, formatCurrency } from "@/utils/currencyUtils";

interface DashboardMetricsProps {
  stats: {
    totalSpend: number;
    totalRevenue: number;
    totalImpressions: number;
    totalClicks: number;
    averageCtr: number;
    averageRoas: number;
    averageCpc: number;
  };
  spendTrendData: { name: string; value: number }[];
  revenueTrendData: { name: string; value: number }[];
  roasTrendData: { name: string; value: number }[];
  ctrTrendData: { name: string; value: number }[];
}

const DashboardMetrics = ({ 
  stats, 
  spendTrendData, 
  revenueTrendData, 
  roasTrendData, 
  ctrTrendData 
}: DashboardMetricsProps) => {
  const { selectedCurrency } = useCurrency();

  // Convert currency amounts (assuming data comes in USD)
  const convertedSpend = convertCurrency(stats.totalSpend, 'USD', selectedCurrency.code);
  const convertedRevenue = convertCurrency(stats.totalRevenue, 'USD', selectedCurrency.code);

  // Convert trend data
  const convertedSpendTrend = spendTrendData.map(item => ({
    ...item,
    value: convertCurrency(item.value, 'USD', selectedCurrency.code)
  }));

  const convertedRevenueTrend = revenueTrendData.map(item => ({
    ...item,
    value: convertCurrency(item.value, 'USD', selectedCurrency.code)
  }));

  // Calculate fake customer count based on clicks (for display purposes)
  const customerCount = Math.floor(stats.totalClicks / 10) || 1456;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <DashboardCard
        title="Customers"
        value={customerCount.toLocaleString()}
        icon={<Users size={24} />}
        trend={{ value: 6.5, isPositive: true }}
        iconBgColor="bg-blue-100"
      />
      <DashboardCard
        title="Revenue"
        value={formatCurrency(convertedRevenue, selectedCurrency.code)}
        icon={<DollarSign size={24} />}
        trend={{ value: 0.10, isPositive: false }}
        iconBgColor="bg-teal-100"
      />
      <DashboardCard
        title="Profit"
        value={`${((stats.averageRoas - 1) * 100).toFixed(0)}%`}
        icon={<TrendingUp size={24} />}
        trend={{ value: 0.2, isPositive: false }}
        iconBgColor="bg-purple-100"
      />
      <DashboardCard
        title="Invoices"
        value="1.135"
        icon={<FileText size={24} />}
        trend={{ value: 11.5, isPositive: true }}
        iconBgColor="bg-blue-100"
      />
    </section>
  );
};

export default DashboardMetrics;
