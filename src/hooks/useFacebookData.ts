
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchUserAdAccounts,
  fetchUserCampaigns,
  fetchUserAdMetrics,
  fetchLastSyncStatus,
  triggerFacebookDataSync,
  FbAdMetric
} from '@/services/facebookService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface DashboardStats {
  totalSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  averageRoas: number;
  averageCpc: number;
}

export interface AdMetric {
  id: string;
  campaign: string;
  adset_id: string;
  adset_name: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  roas: number;
  date: string;
  status: string | null;
  start_time: string | null;
  stop_time: string | null;
}

// Memoized conversion function
const convertToAdMetric = (metrics: FbAdMetric[]): AdMetric[] => {
  return metrics.map(metric => ({
    id: metric.id,
    campaign: metric.campaign_name || '',
    adset_id: metric.adset_id || metric.campaign_id,
    adset_name: metric.adset_name || metric.campaign_name || '',
    impressions: metric.impressions,
    clicks: metric.clicks,
    spend: metric.spend,
    conversions: metric.conversions,
    revenue: metric.revenue,
    ctr: metric.ctr,
    cpc: metric.cpc,
    roas: metric.roas,
    date: metric.date,
    status: metric.campaign_status || null,
    start_time: metric.start_time || null,
    stop_time: metric.stop_time || null
  }));
};

export const useFacebookData = (startDate?: string, endDate?: string, campaignIds?: string[]) => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  // Query configurations with optimized settings
  const queryConfig = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  };

  const accountsQuery = useQuery({
    queryKey: ['adAccounts', user?.id],
    queryFn: fetchUserAdAccounts,
    enabled: !!user,
    ...queryConfig
  });

  const campaignsQuery = useQuery({
    queryKey: ['campaigns', user?.id],
    queryFn: fetchUserCampaigns,
    enabled: !!user,
    ...queryConfig
  });

  const metricsQuery = useQuery({
    queryKey: ['adMetrics', user?.id, startDate, endDate, campaignIds],
    queryFn: () => fetchUserAdMetrics(startDate, endDate, campaignIds),
    enabled: !!user,
    ...queryConfig
  });

  const syncStatusQuery = useQuery({
    queryKey: ['syncStatus', user?.id],
    queryFn: fetchLastSyncStatus,
    enabled: !!user,
    refetchInterval: isSyncing ? 1000 : 5000,
    ...queryConfig
  });

  // Memoized stats calculation
  const stats = useMemo((): DashboardStats => {
    if (!metricsQuery.data) {
      return {
        totalSpend: 0,
        totalRevenue: 0,
        totalImpressions: 0,
        totalClicks: 0,
        averageCtr: 0,
        averageRoas: 0,
        averageCpc: 0
      };
    }

    const metrics = metricsQuery.data;
    
    const totalSpend = metrics.reduce((sum, metric) => sum + Number(metric.spend), 0);
    const totalRevenue = metrics.reduce((sum, metric) => sum + Number(metric.revenue), 0);
    const totalImpressions = metrics.reduce((sum, metric) => sum + metric.impressions, 0);
    const totalClicks = metrics.reduce((sum, metric) => sum + metric.clicks, 0);
    
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    
    return {
      totalSpend,
      totalRevenue,
      totalImpressions,
      totalClicks,
      averageCtr: avgCtr,
      averageRoas: avgRoas,
      averageCpc: avgCpc
    };
  }, [metricsQuery.data]);

  const triggerSync = useCallback(async () => {
    try {
      console.log("Starting sync...");
      setIsSyncing(true);
      
      await triggerFacebookDataSync();
      toast.success("Facebook data sync initiated");
      
      await syncStatusQuery.refetch();
      
      setTimeout(async () => {
        console.log("Refetching data after sync...");
        await Promise.all([
          metricsQuery.refetch(),
          accountsQuery.refetch(),
          campaignsQuery.refetch(),
          syncStatusQuery.refetch()
        ]);
        
        setTimeout(() => {
          setIsSyncing(false);
        }, 3000);
      }, 2000);
      
    } catch (error: any) {
      console.error("Sync error:", error);
      setIsSyncing(false);
      toast.error(`Failed to sync: ${error.message || "Unknown error"}`);
    }
  }, [metricsQuery, accountsQuery, campaignsQuery, syncStatusQuery]);

  // Memoized converted metrics
  const adMetrics = useMemo(() => 
    metricsQuery.data ? convertToAdMetric(metricsQuery.data) : []
  , [metricsQuery.data]);

  return useMemo(() => ({
    accounts: accountsQuery.data || [],
    campaigns: campaignsQuery.data || [],
    metrics: adMetrics,
    rawMetrics: metricsQuery.data || [],
    syncStatus: syncStatusQuery.data,
    stats,
    isLoading: accountsQuery.isLoading || campaignsQuery.isLoading || metricsQuery.isLoading,
    isError: accountsQuery.isError || campaignsQuery.isError || metricsQuery.isError,
    error: accountsQuery.error || campaignsQuery.error || metricsQuery.error,
    triggerSync,
    isSyncing
  }), [
    accountsQuery.data, accountsQuery.isLoading, accountsQuery.isError, accountsQuery.error,
    campaignsQuery.data, campaignsQuery.isLoading, campaignsQuery.isError, campaignsQuery.error,
    metricsQuery.data, metricsQuery.isLoading, metricsQuery.isError, metricsQuery.error,
    adMetrics, syncStatusQuery.data, stats, triggerSync, isSyncing
  ]);
};
