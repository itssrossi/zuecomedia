
import { useMemo } from "react";
import type { AdMetric } from "@/hooks/useFacebookData";

interface UseTrendDataResult {
  spendTrendData: { name: string; value: number }[];
  revenueTrendData: { name: string; value: number }[];
  roasTrendData: { name: string; value: number }[];
  ctrTrendData: { name: string; value: number }[];
}

export const useTrendData = (metrics: AdMetric[]): UseTrendDataResult => {
  return useMemo(() => {
    const getTrendData = (metric: 'spend' | 'revenue' | 'ctr' | 'roas') => {
      if (!metrics || metrics.length === 0) {
        return [{ name: "No Data", value: 0 }];
      }
      
      // Use Map for better performance with large datasets
      const groupedByDate = new Map<string, any>();
      
      for (const item of metrics) {
        const existing = groupedByDate.get(item.date);
        if (!existing) {
          groupedByDate.set(item.date, { 
            spend: Number(item.spend), 
            revenue: Number(item.revenue), 
            clicks: item.clicks, 
            impressions: item.impressions 
          });
        } else {
          existing.spend += Number(item.spend);
          existing.revenue += Number(item.revenue);
          existing.clicks += item.clicks;
          existing.impressions += item.impressions;
        }
      }
      
      if (groupedByDate.size === 0) {
        return [{ name: "No Data", value: 0 }];
      }
      
      // Convert to array and sort
      const sortedEntries = Array.from(groupedByDate.entries()).sort(([a], [b]) => a.localeCompare(b));
      
      return sortedEntries.map(([date, data]) => {
        const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
        const roas = data.spend > 0 ? data.revenue / data.spend : 0;
        
        let value: number;
        switch (metric) {
          case 'spend':
            value = data.spend;
            break;
          case 'revenue':
            value = data.revenue;
            break;
          case 'ctr':
            value = ctr;
            break;
          case 'roas':
            value = roas;
            break;
          default:
            value = 0;
        }
        
        return {
          name: date.slice(5), // Format as "MM-DD"
          value
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
};
