
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subDays } from "date-fns";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { useFacebookData } from "@/hooks/useFacebookData";
import { useAuth } from "@/context/AuthContext";

// Component imports
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardControls from "@/components/dashboard/DashboardControls";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import FacebookAccountSetup from "@/components/dashboard/FacebookAccountSetup";
import { useTrendData } from "@/components/dashboard/DashboardTrendDataHelper";

const Dashboard = () => {
  const { user } = useAuth();
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
    metrics, 
    stats, 
    syncStatus,
    isLoading, 
    triggerSync
  } = useFacebookData(formattedStartDate, formattedEndDate, selectedCampaigns);

  // Use trend data hook to get chart data
  const { spendTrendData, revenueTrendData, roasTrendData, ctrTrendData } = useTrendData(metrics);

  // Effect to auto-refresh when an account is connected
  useEffect(() => {
    if (accountConnected) {
      console.log("Account connected flag detected, triggering sync");
      
      // Reset the flag
      setAccountConnected(false);
      
      // Use a small delay to ensure the backend has processed the new account
      setTimeout(() => {
        // Trigger a sync to fetch data
        triggerSync();
      }, 500);
    }
  }, [accountConnected, triggerSync]);

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleRefreshData = () => {
    triggerSync();
  };

  const handleAccountConnected = () => {
    console.log("Account connection successful, setting accountConnected flag");
    
    // Set the flag to trigger the useEffect
    setAccountConnected(true);
    
    toast.success("Account connected! Syncing data...");
  };

  return (
    <div className="min-h-screen bg-zue-dark text-white theme-transition">
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Date Range and Sync Controls */}
        <DashboardControls
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
          onRefreshData={handleRefreshData}
          syncStatus={syncStatus}
        />

        {accounts.length === 0 ? (
          <FacebookAccountSetup onSuccess={handleAccountConnected} />
        ) : (
          <>
            {/* Key Metrics Section */}
            <DashboardMetrics
              stats={stats}
              spendTrendData={spendTrendData}
              revenueTrendData={revenueTrendData}
              roasTrendData={roasTrendData}
              ctrTrendData={ctrTrendData}
            />

            {/* Charts and Table Section */}
            <DashboardCharts metrics={metrics} isLoading={isLoading} />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
