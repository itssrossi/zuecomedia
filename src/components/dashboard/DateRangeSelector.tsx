
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeSelectorProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onDateRangeChange: (start: Date | undefined, end: Date | undefined) => void;
}

const DateRangeSelector = ({
  startDate,
  endDate,
  onDateRangeChange,
}: DateRangeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleQuickSelect = (days: number) => {
    const start = new Date();
    start.setDate(start.getDate() - days);
    const end = new Date();
    end.setDate(end.getDate() + 7); // Include future dates
    
    onDateRangeChange(start, end);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate && endDate ? (
              <>
                {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
              </>
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border-gray-300" align="start">
          <div className="grid gap-4 p-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-sm text-gray-600 mb-1">Start Date</div>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => onDateRangeChange(date, endDate)}
                  disabled={(date) => endDate ? date > endDate : false}
                  className="bg-white rounded-md"
                />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">End Date</div>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => onDateRangeChange(startDate, date)}
                  disabled={(date) => startDate ? date < startDate : false}
                  className="bg-white rounded-md"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700"
                onClick={() => handleQuickSelect(7)}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700"
                onClick={() => handleQuickSelect(30)}
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700"
                onClick={() => handleQuickSelect(90)}
              >
                Last 90 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700"
                onClick={() => {
                  onDateRangeChange(undefined, undefined);
                  setIsOpen(false);
                }}
              >
                All time
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeSelector;
