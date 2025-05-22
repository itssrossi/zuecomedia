
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DateRangeSelector from "@/components/dashboard/DateRangeSelector";

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
  return (
    <div className="flex justify-between items-center mb-8">
      <DateRangeSelector 
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={onDateRangeChange}
      />
      
      <div className="flex items-center space-x-4">
        {syncStatus && (
          <span className="text-sm text-gray-300">
            Last sync: {new Date(syncStatus.last_sync_at).toLocaleString()}
          </span>
        )}
        
        <Button
          onClick={onRefreshData}
          className="flex items-center space-x-2 bg-zue-blue hover:bg-blue-700"
        >
          <RefreshCcw size={16} />
          <span>Sync Data</span>
        </Button>
      </div>
    </div>
  );
};

export default DashboardControls;
