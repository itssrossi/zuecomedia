
import { 
  BarChart4, 
  DollarSign, 
  TrendingUp, 
  MousePointerClick
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

  // Convert currency amounts - assuming data comes in ZAR (South African Rand)
  // since that's what the user's Facebook account is providing
  const sourceCurrency = 'ZAR'; // The currency from Facebook ads data
  
  const convertedSpend = convertCurrency(stats.totalSpend, sourceCurrency, selectedCurrency.code);
  const convertedRevenue = convertCurrency(stats.totalRevenue, sourceCurrency, selectedCurrency.code);
  const convertedCpc = convertCurrency(stats.averageCpc, sourceCurrency, selectedCurrency.code);

  // Convert trend data from ZAR to selected currency
  const convertedSpendTrend = spendTrendData.map(item => ({
    ...item,
    value: convertCurrency(item.value, sourceCurrency, selectedCurrency.code)
  }));

  const convertedRevenueTrend = revenueTrendData.map(item => ({
    ...item,
    value: convertCurrency(item.value, sourceCurrency, selectedCurrency.code)
  }));

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <DashboardCard
        title="Total Ad Spend"
        value={formatCurrency(convertedSpend, selectedCurrency.code)}
        icon={<DollarSign size={20} />}
        trend={{ value: 12.5, isPositive: true }}
        chartComponent={<CampaignTrendChart data={convertedSpendTrend} color="#3182CE" />}
      />
      <DashboardCard
        title="Total Revenue"
        value={formatCurrency(convertedRevenue, selectedCurrency.code)}
        icon={<TrendingUp size={20} />}
        trend={{ value: 18.3, isPositive: true }}
        chartComponent={<CampaignTrendChart data={convertedRevenueTrend} color="#38A169" />}
      />
      <DashboardCard
        title="Average ROAS"
        value={`${stats.averageRoas.toFixed(2)}x`}
        icon={<BarChart4 size={20} />}
        trend={{ value: 5.2, isPositive: true }}
        chartComponent={
          <MetricPieChart 
            value={Math.round(stats.averageRoas * 100) / 100} 
            maxValue={10}
            title="ROAS"
            color="#38A169"
          />
        }
      />
      <DashboardCard
        title="Average CTR"
        value={`${stats.averageCtr.toFixed(2)}%`}
        icon={<MousePointerClick size={20} />}
        trend={{ value: 0.8, isPositive: true }}
        chartComponent={
          <MetricPieChart 
            value={Math.round(stats.averageCtr * 10) / 10}
            maxValue={10}
            title="CTR"
            color="#3182CE"
            isPercentage
          />
        }
      />
    </section>
  );
};

export default DashboardMetrics;
