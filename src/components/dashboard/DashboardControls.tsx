
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DateRangeSelector from "@/components/dashboard/DateRangeSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeToggle from "@/components/dashboard/ThemeToggle";

interface DashboardControlsProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onDateRangeChange: (start: Date | undefined, end: Date | undefined) => void;
  onRefreshData: () => void;
  syncStatus?: { last_sync_at: string } | null;
}

const DashboardControls = ({
  startDate,
  endDate,
  onDateRangeChange,
  onRefreshData,
  syncStatus
}: DashboardControlsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'flex-col space-y-4' : 'flex justify-between items-center'} mb-8`}>
      <DateRangeSelector 
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={onDateRangeChange}
      />
      
      <div className={`flex items-center ${isMobile ? 'justify-between w-full' : 'space-x-4'}`}>
        {syncStatus && (
          <span className="text-sm text-gray-300">
            Last sync: {new Date(syncStatus.last_sync_at).toLocaleString()}
          </span>
        )}
        
        <div className="flex items-center space-x-2">
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
