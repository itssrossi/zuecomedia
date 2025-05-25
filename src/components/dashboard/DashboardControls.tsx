
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DateRangeSelector from "./DateRangeSelector";
import CurrencySelector from "./CurrencySelector";
import type { SyncStatus } from "@/services/facebookService";

interface DashboardControlsProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onDateRangeChange: (start: Date | undefined, end: Date | undefined) => void;
  onRefreshData: () => void;
  syncStatus: SyncStatus | null;
}

const DashboardControls = ({
  startDate,
  endDate,
  onDateRangeChange,
  onRefreshData,
  syncStatus
}: DashboardControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={onDateRangeChange}
        />
        <CurrencySelector />
      </div>
      
      <div className="flex items-center gap-4">
        {syncStatus && (
          <div className="text-sm text-gray-400">
            Last sync: {new Date(syncStatus.last_sync_at).toLocaleString()}
          </div>
        )}
        
        <Button 
          onClick={onRefreshData} 
          variant="outline" 
          size="sm"
          className="bg-zue-dark-light border-gray-700 text-white hover:bg-zue-dark hover:text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync Data
        </Button>
      </div>
    </div>
  );
};

export default DashboardControls;
