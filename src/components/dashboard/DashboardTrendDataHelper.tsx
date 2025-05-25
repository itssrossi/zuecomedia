
import { useMemo } from "react";
import type { AdMetric } from "@/hooks/useFacebookData";

interface UseTrendDataResult {
  spendTrendData: { name: string; value: number }[];
  revenueTrendData: { name: string; value: number }[];
  roasTrendData: { name: string; value: number }[];
  ctrTrendData: { name: string; value: number }[];
}

export const useTrendData = (metrics: AdMetric[]): UseTrendDataResult => {
  const trendData = useMemo(() => {
    const getTrendData = (metric: 'spend' | 'revenue' | 'ctr' | 'roas') => {
      if (!metrics || metrics.length === 0) {
        // Return some default data points to prevent empty charts
        return [
          { name: "No Data", value: 0 }
        ];
      }
      
      // Group metrics by date
      const groupedByDate: Record<string, any> = {};
      
      metrics.forEach(item => {
        if (!groupedByDate[item.date]) {
          groupedByDate[item.date] = { 
            spend: 0, 
            revenue: 0, 
            clicks: 0, 
            impressions: 0 
          };
        }
        groupedByDate[item.date].spend += Number(item.spend);
        groupedByDate[item.date].revenue += Number(item.revenue);
        groupedByDate[item.date].clicks += item.clicks;
        groupedByDate[item.date].impressions += item.impressions;
      });
      
      // Convert to array and sort by date
      const sortedDates = Object.keys(groupedByDate).sort();
      
      if (sortedDates.length === 0) {
        return [{ name: "No Data", value: 0 }];
      }
      
      return sortedDates.map(date => {
        const data = groupedByDate[date];
        const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
        const roas = data.spend > 0 ? data.revenue / data.spend : 0;
        
        return {
          name: date.slice(5), // Format as "MM-DD"
          value: metric === 'spend' ? data.spend :
                metric === 'revenue' ? data.revenue :
                metric === 'ctr' ? ctr :
                roas
        };
      });
    };

    return {
      spendTrendData: getTrendData('spend'),
      revenueTrendData: getTrendData('revenue'),
      roasTrendData: getTrendData('roas'),
      ctrTrendData: getTrendData('ctr')
    };
  }, [metrics]);

  return trendData;
};
