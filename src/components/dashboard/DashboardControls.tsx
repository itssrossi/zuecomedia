
import { RefreshCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DateRangeSelector from "@/components/dashboard/DateRangeSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeToggle from "@/components/dashboard/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { FbCampaign } from "@/services/facebookService";

interface DashboardControlsProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onDateRangeChange: (start: Date | undefined, end: Date | undefined) => void;
  onRefreshData: () => void;
  syncStatus?: { last_sync_at: string; sync_status?: string } | null;
  campaigns?: FbCampaign[];
  selectedCampaign?: string; // "" = All
  onCampaignChange?: (value: string) => void;
}

const DashboardControls = ({
  startDate,
  endDate,
  onDateRangeChange,
  onRefreshData,
  syncStatus,
  campaigns = [],
  selectedCampaign = "",
  onCampaignChange,
}: DashboardControlsProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const goToOnboarding = () => {
    navigate('/onboarding');
  };
  
  return (
    <div className={`${isMobile ? 'flex-col space-y-4' : 'flex justify-between items-center'} mb-8`}>
      <div className={`flex ${isMobile ? 'flex-col space-y-2 w-full' : 'items-center gap-3'}`}>
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={onDateRangeChange}
        />
        {onCampaignChange && (
          <Select value={selectedCampaign || "all"} onValueChange={(v) => onCampaignChange(v === "all" ? "" : v)}>
            <SelectTrigger className="min-w-[220px] bg-zue-dark-light border-gray-700 text-white">
              <SelectValue placeholder="All Campaigns" />
            </SelectTrigger>
            <SelectContent className="bg-zue-dark-light border-gray-700 text-white">
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.campaign_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className={`flex items-center ${isMobile ? 'justify-between w-full' : 'space-x-4'}`}>
        {syncStatus && (
          <div className="text-sm text-gray-300">
            <span>Last sync: {new Date(syncStatus.last_sync_at).toLocaleString()}</span>
            {syncStatus.sync_status && syncStatus.sync_status !== 'success' && (
              <p className="max-w-md text-xs text-red-300">{syncStatus.sync_status}</p>
            )}
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className={`
              ${theme === 'light' 
                ? 'border-zue-blue text-gray-800 hover:bg-zue-blue/10' 
                : 'border-zue-blue text-white hover:bg-zue-blue/20'}
              flex items-center gap-2
            `}
            onClick={goToOnboarding}
          >
            <CheckCircle size={16} />
            {isMobile ? '' : 'Onboarding Checklist'}
          </Button>
          <ThemeToggle />
          <Button
            onClick={onRefreshData}
            className="flex items-center space-x-2 bg-zue-blue hover:bg-blue-700"
          >
            <RefreshCcw size={16} />
            <span>Sync Data</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardControls;
