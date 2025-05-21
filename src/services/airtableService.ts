
import { toast } from "@/components/ui/sonner";

export interface AdMetric {
  id: string;
  campaign: string;
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  conversions: number;
  revenue: number;
  roas: number;
}

// Demo data - replace this with actual Airtable API call
const mockData: AdMetric[] = [
  {
    id: "1",
    campaign: "Summer Sale 2023",
    date: "2023-07-15",
    impressions: 24500,
    clicks: 980,
    ctr: 4.0,
    spend: 1200,
    conversions: 85,
    revenue: 6800,
    roas: 5.67
  },
  {
    id: "2",
    campaign: "Back to School",
    date: "2023-08-20",
    impressions: 18700,
    clicks: 745,
    ctr: 3.98,
    spend: 950,
    conversions: 62,
    revenue: 4960,
    roas: 5.22
  },
  {
    id: "3",
    campaign: "Black Friday",
    date: "2023-11-24",
    impressions: 45000,
    clicks: 2250,
    ctr: 5.0,
    spend: 3000,
    conversions: 210,
    revenue: 16800,
    roas: 5.6
  },
  {
    id: "4",
    campaign: "Holiday Special",
    date: "2023-12-15",
    impressions: 32000,
    clicks: 1600,
    ctr: 5.0,
    spend: 2400,
    conversions: 180,
    revenue: 14400,
    roas: 6.0
  },
  {
    id: "5",
    campaign: "New Year Promo",
    date: "2024-01-05",
    impressions: 21000,
    clicks: 840,
    ctr: 4.0,
    spend: 1050,
    conversions: 70,
    revenue: 5600,
    roas: 5.33
  }
];

export const fetchAdMetrics = async (): Promise<AdMetric[]> => {
  try {
    // In a real implementation, you would make an API call to Airtable here
    // Something like:
    // const response = await fetch('https://api.airtable.com/v0/YOUR_BASE_ID/YOUR_TABLE_NAME', {
    //   headers: {
    //     'Authorization': `Bearer ${YOUR_AIRTABLE_API_KEY}`
    //   }
    // });
    // const data = await response.json();
    // return data.records.map(record => ({
    //   id: record.id,
    //   ...record.fields
    // }));
    
    // For demo purposes, we're just returning mock data after a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData;
  } catch (error) {
    console.error('Error fetching ad metrics:', error);
    toast.error('Failed to load ad metrics');
    return [];
  }
};

export const fetchTotalStats = async (): Promise<{
  totalSpend: number;
  totalRevenue: number;
  averageRoas: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
}> => {
  try {
    const metrics = await fetchAdMetrics();
    
    const totalSpend = metrics.reduce((sum, metric) => sum + metric.spend, 0);
    const totalRevenue = metrics.reduce((sum, metric) => sum + metric.revenue, 0);
    const totalImpressions = metrics.reduce((sum, metric) => sum + metric.impressions, 0);
    const totalClicks = metrics.reduce((sum, metric) => sum + metric.clicks, 0);
    
    return {
      totalSpend,
      totalRevenue,
      averageRoas: totalRevenue / totalSpend,
      totalImpressions,
      totalClicks,
      averageCtr: (totalClicks / totalImpressions) * 100
    };
  } catch (error) {
    console.error('Error fetching total stats:', error);
    toast.error('Failed to calculate total statistics');
    return {
      totalSpend: 0,
      totalRevenue: 0,
      averageRoas: 0,
      totalImpressions: 0,
      totalClicks: 0,
      averageCtr: 0
    };
  }
};
