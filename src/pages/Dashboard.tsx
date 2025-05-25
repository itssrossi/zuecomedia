
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subDays, addDays } from "date-fns";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { useFacebookData } from "@/hooks/useFacebookData";
import { useAuth } from "@/context/AuthContext";

// Component imports
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
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
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 7)); // Include future dates
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

  const handleRefreshData = async () => {
    await triggerSync();
    // The sync status will automatically update through the query refetch
  };

  const handleAccountConnected = () => {
    console.log("Account connection successful, setting accountConnected flag");
    
    // Set the flag to trigger the useEffect
    setAccountConnected(true);
    
    toast.success("Account connected! Syncing data...");
  };

  return (
    <DashboardLayout>
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Dashboard Content */}
      <main className="p-6 bg-gray-50 min-h-screen">
        {accounts.length === 0 ? (
          <FacebookAccountSetup onSuccess={handleAccountConnected} />
        ) : (
          <>
            {/* Date Range and Sync Controls */}
            <div className="mb-6">
              <DashboardControls
                startDate={startDate}
                endDate={endDate}
                onDateRangeChange={handleDateRangeChange}
                onRefreshData={handleRefreshData}
                syncStatus={syncStatus}
              />
            </div>

            {/* Debug information */}
            {metrics.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-yellow-800 font-medium mb-2">No Data Found</h3>
                <p className="text-yellow-700 text-sm">
                  No metrics data found for the selected date range. 
                  Try expanding your date range or check if your campaigns have any activity.
                </p>
                <p className="text-yellow-700 text-sm mt-2">
                  Current range: {startDate ? format(startDate, 'yyyy-MM-dd') : 'Not set'} to {endDate ? format(endDate, 'yyyy-MM-dd') : 'Not set'}
                </p>
              </div>
            )}

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
    </DashboardLayout>
  );
};

export default Dashboard;
