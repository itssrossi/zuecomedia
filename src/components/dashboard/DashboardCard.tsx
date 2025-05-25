
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  chartComponent?: ReactNode;
  iconBgColor?: string;
}

const DashboardCard = ({
  title,
  value,
  icon,
  trend,
  className = "",
  chartComponent,
  iconBgColor = "bg-blue-100"
}: DashboardCardProps) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {trend && (
              <span className={`text-sm font-medium flex items-center gap-1 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '↗' : '↘'} {trend.isPositive ? '+' : ''}{trend.value}%
                <span className="text-gray-500 font-normal">Since last week</span>
              </span>
            )}
          </div>
        </div>
        
        {icon && (
          <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <div className="text-blue-600">
              {icon}
            </div>
          </div>
        )}
      </div>

      {chartComponent && (
        <div className="mt-4">
          {chartComponent}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
