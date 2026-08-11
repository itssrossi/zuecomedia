import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subDays, addDays } from "date-fns";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { useFacebookData } from "@/hooks/useFacebookData";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Component imports
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardControls from "@/components/dashboard/DashboardControls";
import FacebookAccountSetup from "@/components/dashboard/FacebookAccountSetup";
import { useTrendData } from "@/components/dashboard/DashboardTrendDataHelper";
import CustomizableGrid from "@/components/dashboard/CustomizableGrid";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 7));
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [accountConnected, setAccountConnected] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const { tiles, updateTiles, reportEmail } = useDashboardLayout();

  // Format dates for API calls
  const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
  const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;

  // Use our custom hook to fetch Facebook data
  const { 
    accounts,
    campaigns,
    metrics, 
    ads,
    stats, 
    syncStatus,
    isLoading, 
    triggerSync
  } = useFacebookData(formattedStartDate, formattedEndDate, selectedCampaign ? [selectedCampaign] : []);

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

  const handleSendReport = async () => {
    if (!reportEmail) {
      toast.error("Set a report email address in Settings first.");
      return;
    }
    try {
      setSendingReport(true);
      const { error } = await supabase.functions.invoke("send-weekly-report", { body: {} });
      if (error) throw error;
      toast.success(`Weekly report sent to ${reportEmail}`);
    } catch (e: any) {
      toast.error(`Failed to send report: ${e.message || "Unknown error"}`);
    } finally {
      setSendingReport(false);
    }
  };

  // Get user's display name
  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <div className="min-h-screen bg-zue-dark text-white theme-transition">
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Welcome, {getUserDisplayName()}!
            </h2>
            <p className="text-gray-400 mt-1">Here's your Facebook advertising performance overview</p>
          </div>
          <Button
            onClick={handleSendReport}
            disabled={sendingReport}
            variant="outline"
            className="border-zue-blue text-white hover:bg-zue-blue/20"
          >
            <Mail size={16} className="mr-2" />
            {sendingReport ? "Sending..." : "Email Weekly Report"}
          </Button>
        </div>

        {/* Date Range and Sync Controls */}
        <DashboardControls
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
          onRefreshData={handleRefreshData}
          syncStatus={syncStatus}
          campaigns={campaigns}
          selectedCampaign={selectedCampaign}
          onCampaignChange={setSelectedCampaign}
        />

        {accounts.length === 0 ? (
          <FacebookAccountSetup onSuccess={handleAccountConnected} />
        ) : (
          <>
            {metrics.length === 0 && (
              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
                <h3 className="text-yellow-400 font-medium mb-2">No Data Found</h3>
                <p className="text-yellow-200 text-sm">
                  No metrics data found for the selected date range. Try expanding your date range or check if your campaigns have any activity.
                </p>
              </div>
            )}
            <CustomizableGrid
              tiles={tiles}
              onChange={updateTiles}
              metrics={metrics}
              ads={ads}
              stats={stats}
              isLoading={isLoading}
              trends={{ spendTrendData, revenueTrendData, roasTrendData, ctrTrendData }}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
