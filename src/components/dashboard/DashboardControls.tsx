
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import DateRangeSelector from "./DateRangeSelector";
import ThemeToggle from "./ThemeToggle";
import CurrencySelector from "./CurrencySelector";
import { SyncStatus } from "@/hooks/useFacebookData";

interface DashboardControlsProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onDateRangeChange: (start: Date | undefined, end: Date | undefined) => void;
  onRefreshData: () => void;
  syncStatus: SyncStatus;
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
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      <div className="flex-1">
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={onDateRangeChange}
        />
      </div>
      
      <div className="flex items-center gap-3">
        <Button
          onClick={onRefreshData}
          disabled={syncStatus.isLoading}
          className="bg-zue-blue hover:bg-zue-blue-dark text-white gap-2"
        >
          <RefreshCw 
            size={16} 
            className={syncStatus.isLoading ? "animate-spin" : ""} 
          />
          {syncStatus.isLoading ? "Syncing..." : "Sync Data"}
        </Button>

        {/* Desktop-only controls */}
        {!isMobile && (
          <>
            <ThemeToggle />
            <div className="w-48">
              <CurrencySelector />
            </div>
            <Link to="/onboarding">
              <Button variant="outline" className="gap-2">
                <Settings size={16} />
                Onboarding
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardControls;
