
import { TrendingUp, Target, DollarSign, Users } from "lucide-react";
import DashboardCard from "./DashboardCard";
import CampaignTrendChart from "./CampaignTrendChart";
import { useCurrency } from "@/context/CurrencyContext";
import { convertCurrency, formatCurrency } from "@/utils/currencyUtils";
import type { AdMetric } from "@/hooks/useFacebookData";

interface AdsetPerformanceCardProps {
  metrics: AdMetric[];
}

const AdsetPerformanceCard = ({ metrics }: AdsetPerformanceCardProps) => {
  const { selectedCurrency } = useCurrency();

  // Group metrics by actual adset (using adset_id and adset_name)
  const adsetData = metrics.reduce((acc, metric) => {
    const key = metric.adset_id; // Use adset_id as the key
    if (!acc[key]) {
      acc[key] = {
        id: metric.adset_id,
        name: metric.adset_name,
        campaign: metric.campaign,
        spend: 0,
        revenue: 0,
        conversions: 0,
        impressions: 0,
        clicks: 0,
        roas: 0,
        ctr: 0
      };
    }
    
    acc[key].spend += metric.spend;
    acc[key].revenue += metric.revenue;
    acc[key].conversions += metric.conversions;
    acc[key].impressions += metric.impressions;
    acc[key].clicks += metric.clicks;
    
    return acc;
  }, {} as Record<string, any>);

  // Calculate derived metrics and sort by performance
  const adsets = Object.values(adsetData).map((adset: any) => ({
    ...adset,
    roas: adset.spend > 0 ? adset.revenue / adset.spend : 0,
    ctr: adset.impressions > 0 ? (adset.clicks / adset.impressions) * 100 : 0
  })).sort((a, b) => b.roas - a.roas);

  const topAdset = adsets[0];

  if (!topAdset) {
    return (
      <DashboardCard
        title="Top Performing Ad Set"
        value="No data"
        icon={<TrendingUp size={20} />}
      />
    );
  }

  const convertedSpend = convertCurrency(topAdset.spend, 'USD', selectedCurrency.code);
  const convertedRevenue = convertCurrency(topAdset.revenue, 'USD', selectedCurrency.code);

  // Create trend data for the chart
  const trendData = adsets.slice(0, 7).map((adset, index) => ({
    name: adset.name.substring(0, 10) + "...",
    value: adset.roas
  }));

  return (
    <div className="space-y-6">
      {/* Top Performing Adset Card */}
      <DashboardCard
        title="Top Performing Ad Set"
        value={topAdset.name}
        icon={<TrendingUp size={20} />}
        trend={{
          value: Math.round(topAdset.roas * 100) / 100,
          isPositive: topAdset.roas > 1
        }}
        chartComponent={
          <CampaignTrendChart
            data={trendData}
            color="#3B82F6"
            height={60}
          />
        }
      />

      {/* Adset Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          title="Top ROAS"
          value={`${topAdset.roas.toFixed(2)}x`}
          icon={<DollarSign size={16} />}
          className="text-center"
        />
        <DashboardCard
          title="Revenue"
          value={formatCurrency(convertedRevenue, selectedCurrency.code)}
          icon={<Target size={16} />}
          className="text-center"
        />
        <DashboardCard
          title="Conversions"
          value={topAdset.conversions.toLocaleString()}
          icon={<Users size={16} />}
          className="text-center"
        />
      </div>

      {/* Adset Performance Table */}
      <div className="bg-zue-dark-light rounded-lg p-6 border border-gray-800 shadow-md">
        <h3 className="text-lg font-semibold text-white mb-4">Ad Set Performance Ranking</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400">Rank</th>
                <th className="text-left py-2 text-gray-400">Ad Set</th>
                <th className="text-left py-2 text-gray-400">Campaign</th>
                <th className="text-right py-2 text-gray-400">ROAS</th>
                <th className="text-right py-2 text-gray-400">Spend</th>
                <th className="text-right py-2 text-gray-400">Revenue</th>
                <th className="text-right py-2 text-gray-400">CTR</th>
              </tr>
            </thead>
            <tbody>
              {adsets.slice(0, 10).map((adset, index) => {
                const convertedAdsetSpend = convertCurrency(adset.spend, 'USD', selectedCurrency.code);
                const convertedAdsetRevenue = convertCurrency(adset.revenue, 'USD', selectedCurrency.code);
                
                return (
                  <tr key={adset.id} className="border-b border-gray-800 hover:bg-zue-dark-light/50">
                    <td className="py-2">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-2 text-white max-w-xs truncate" title={adset.name}>
                      {adset.name}
                    </td>
                    <td className="py-2 text-gray-300 max-w-xs truncate" title={adset.campaign}>
                      {adset.campaign}
                    </td>
                    <td className="py-2 text-right">
                      <span className={`font-medium ${adset.roas > 1 ? 'text-green-400' : 'text-red-400'}`}>
                        {adset.roas.toFixed(2)}x
                      </span>
                    </td>
                    <td className="py-2 text-right text-gray-300">
                      {formatCurrency(convertedAdsetSpend, selectedCurrency.code)}
                    </td>
                    <td className="py-2 text-right text-gray-300">
                      {formatCurrency(convertedAdsetRevenue, selectedCurrency.code)}
                    </td>
                    <td className="py-2 text-right text-gray-300">
                      {adset.ctr.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdsetPerformanceCard;
