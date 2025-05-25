
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
}

const DashboardCard = ({
  title,
  value,
  icon,
  trend,
  className = "",
  chartComponent
}: DashboardCardProps) => {
  return (
    <div className={`bg-zue-dark-light p-6 rounded-lg shadow-md border border-gray-800 hover:border-zue-blue/50 transition-all duration-300 ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-gray-400 font-medium text-sm">{title}</h3>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
      
      <div className="flex items-end space-x-2 mb-3">
        <span className="text-2xl font-bold text-white">{value}</span>
        
        {trend && (
          <span className={`text-sm font-medium flex items-center ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {chartComponent && (
        <div className="mt-2">
          {chartComponent}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
