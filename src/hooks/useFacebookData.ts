
import { useState, useEffect } from 'react';
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

// Define AdMetric type to match what the components expect
export interface AdMetric {
  id: string;
  campaign: string; // This is what the component is expecting
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  roas: number;
  date: string;
}

// Helper function to convert FbAdMetric to AdMetric
const convertToAdMetric = (metrics: FbAdMetric[]): AdMetric[] => {
  return metrics.map(metric => ({
    id: metric.id,
    campaign: metric.campaign_name || '', // Use campaign_name or empty string
    impressions: metric.impressions,
    clicks: metric.clicks,
    spend: metric.spend,
    conversions: metric.conversions,
    revenue: metric.revenue,
    ctr: metric.ctr,
    cpc: metric.cpc,
    roas: metric.roas,
    date: metric.date
  }));
};

export const useFacebookData = (startDate?: string, endDate?: string, campaignIds?: string[]) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSpend: 0,
    totalRevenue: 0,
    totalImpressions: 0,
    totalClicks: 0,
    averageCtr: 0,
    averageRoas: 0,
    averageCpc: 0
  });

  // Query for ad accounts
  const accountsQuery = useQuery({
    queryKey: ['adAccounts', user?.id],
    queryFn: fetchUserAdAccounts,
    enabled: !!user
  });

  // Query for campaigns
  const campaignsQuery = useQuery({
    queryKey: ['campaigns', user?.id],
    queryFn: fetchUserCampaigns,
    enabled: !!user
  });

  // Query for ad metrics
  const metricsQuery = useQuery({
    queryKey: ['adMetrics', user?.id, startDate, endDate, campaignIds],
    queryFn: () => fetchUserAdMetrics(startDate, endDate, campaignIds),
    enabled: !!user
  });

  // Query for sync status
  const syncStatusQuery = useQuery({
    queryKey: ['syncStatus', user?.id],
    queryFn: fetchLastSyncStatus,
    enabled: !!user,
    refetchInterval: 60000 // Refetch every minute
  });

  // Calculate stats from metrics
  useEffect(() => {
    if (metricsQuery.data) {
      const metrics = metricsQuery.data;
      
      const totalSpend = metrics.reduce((sum, metric) => sum + Number(metric.spend), 0);
      const totalRevenue = metrics.reduce((sum, metric) => sum + Number(metric.revenue), 0);
      const totalImpressions = metrics.reduce((sum, metric) => sum + metric.impressions, 0);
      const totalClicks = metrics.reduce((sum, metric) => sum + metric.clicks, 0);
      
      // Calculate averages
      const avgCtr = totalImpressions > 0 
        ? (totalClicks / totalImpressions) * 100 
        : 0;
        
      const avgRoas = totalSpend > 0 
        ? totalRevenue / totalSpend 
        : 0;
        
      const avgCpc = totalClicks > 0 
        ? totalSpend / totalClicks 
        : 0;
      
      setStats({
        totalSpend,
        totalRevenue,
        totalImpressions,
        totalClicks,
        averageCtr: avgCtr,
        averageRoas: avgRoas,
        averageCpc: avgCpc
      });
    }
  }, [metricsQuery.data]);

  // Function to manually trigger a sync
  const triggerSync = async () => {
    try {
      await triggerFacebookDataSync();
      toast.success("Facebook data sync initiated");
    } catch (error: any) {
      toast.error(`Failed to sync: ${error.message || "Unknown error"}`);
    }
  };

  // Convert FbAdMetric to AdMetric for components that expect AdMetric
  const adMetrics: AdMetric[] = metricsQuery.data ? convertToAdMetric(metricsQuery.data) : [];

  return {
    accounts: accountsQuery.data || [],
    campaigns: campaignsQuery.data || [],
    metrics: adMetrics, // Return the converted metrics
    rawMetrics: metricsQuery.data || [], // Also provide raw metrics if needed
    syncStatus: syncStatusQuery.data,
    stats,
    isLoading: accountsQuery.isLoading || campaignsQuery.isLoading || metricsQuery.isLoading,
    isError: accountsQuery.isError || campaignsQuery.isError || metricsQuery.isError,
    error: accountsQuery.error || campaignsQuery.error || metricsQuery.error,
    triggerSync
  };
};
