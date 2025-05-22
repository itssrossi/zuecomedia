
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/dashboard/DashboardCard";
import CampaignTable from "@/components/dashboard/CampaignTable";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import CampaignPieChart from "@/components/dashboard/CampaignPieChart";
import MetricPieChart from "@/components/dashboard/MetricPieChart";
import CampaignTrendChart from "@/components/dashboard/CampaignTrendChart";
import FacebookAccountSetup from "@/components/dashboard/FacebookAccountSetup";
import DateRangeSelector from "@/components/dashboard/DateRangeSelector";
import { useFacebookData } from "@/hooks/useFacebookData";
import { 
  BarChart4, 
  DollarSign, 
  TrendingUp, 
  LineChart, 
  MousePointerClick,
  RefreshCcw,
  CheckCircle
} from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [accountConnected, setAccountConnected] = useState(false);

  // Format dates for API calls
  const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
  const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;

  // Use our custom hook to fetch Facebook data
  const { 
    accounts,
    campaigns, 
    metrics, 
    stats, 
    syncStatus,
    isLoading, 
    triggerSync
  } = useFacebookData(formattedStartDate, formattedEndDate, selectedCampaigns);

  // Effect to auto-refresh when an account is connected
  useEffect(() => {
    if (accountConnected) {
      // Reset the flag
      setAccountConnected(false);
      
      // Trigger a sync to fetch data
      triggerSync();
    }
  }, [accountConnected, triggerSync]);

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleRefreshData = () => {
    triggerSync();
  };

  const goToOnboarding = () => {
    navigate('/onboarding');
  };

  const handleAccountConnected = () => {
    // Set the flag to trigger the useEffect
    setAccountConnected(true);
    
    toast.success("Account connected! Syncing data...");
  };

  // Sample trend data (in a production app, this would come from the actual metrics)
  const getTrendData = (metric: 'spend' | 'revenue' | 'ctr' | 'roas') => {
    if (!metrics || metrics.length === 0) return [];
    
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

  const spendTrendData = getTrendData('spend');
  const revenueTrendData = getTrendData('revenue');
  const roasTrendData = getTrendData('roas');
  const ctrTrendData = getTrendData('ctr');

  return (
    <div className="min-h-screen bg-zue-dark text-white">
      {/* Dashboard Header */}
      <header className="bg-zue-dark-light shadow-md py-4 px-6 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              src="/lovable-uploads/d341fa26-afd0-418c-9c97-902fff2b93e2.png"
              alt="Zue Co Media Logo"
              className="h-8"
            />
            <h1 className="text-xl font-bold">
              Zue<span className="text-zue-blue">Co</span> Analytics Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="border-zue-blue text-white hover:bg-zue-blue/20 flex items-center gap-2"
              onClick={goToOnboarding}
            >
              <CheckCircle size={16} />
              Onboarding Checklist
            </Button>
            {user && (
              <span className="text-sm text-gray-300">
                {user.email}
              </span>
            )}
            <Button
              variant="outline"
              className="border-gray-600 text-white hover:bg-zue-dark hover:text-white"
              onClick={signOut}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Date Range and Sync Controls */}
        <div className="flex justify-between items-center mb-8">
          <DateRangeSelector 
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
          />
          
          <div className="flex items-center space-x-4">
            {syncStatus && (
              <span className="text-sm text-gray-300">
                Last sync: {new Date(syncStatus.last_sync_at).toLocaleString()}
              </span>
            )}
            
            <Button
              onClick={handleRefreshData}
              className="flex items-center space-x-2 bg-zue-blue hover:bg-blue-700"
            >
              <RefreshCcw size={16} />
              <span>Sync Data</span>
            </Button>
          </div>
        </div>

        {accounts.length === 0 ? (
          <FacebookAccountSetup onSuccess={handleAccountConnected} />
        ) : (
          <>
            {/* Key Metrics Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard
                title="Total Ad Spend"
                value={`$${stats.totalSpend.toLocaleString()}`}
                icon={<DollarSign size={20} />}
                trend={{ value: 12.5, isPositive: true }}
                chartComponent={<CampaignTrendChart data={spendTrendData} color="#3182CE" />}
              />
              <DashboardCard
                title="Total Revenue"
                value={`$${stats.totalRevenue.toLocaleString()}`}
                icon={<TrendingUp size={20} />}
                trend={{ value: 18.3, isPositive: true }}
                chartComponent={<CampaignTrendChart data={revenueTrendData} color="#38A169" />}
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

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <PerformanceChart data={metrics} isLoading={isLoading} />
              </div>
              <div>
                <CampaignPieChart 
                  data={metrics} 
                  isLoading={isLoading} 
                  metric="spend" 
                  title="Ad Spend Distribution"
                />
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <CampaignPieChart 
                data={metrics} 
                isLoading={isLoading} 
                metric="revenue" 
                title="Revenue Distribution"
              />
              <CampaignPieChart 
                data={metrics} 
                isLoading={isLoading} 
                metric="conversions" 
                title="Conversions Distribution"
              />
            </section>

            {/* Campaign Table Section */}
            <section className="bg-zue-dark-light rounded-lg p-6 border border-gray-800 shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart4 size={20} className="text-zue-blue" />
                Facebook Ad Campaigns
              </h2>
              <CampaignTable campaigns={metrics} isLoading={isLoading} />
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
