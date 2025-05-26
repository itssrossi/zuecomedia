
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface MetricPieChartProps {
  value: number;
  maxValue?: number;
  title: string;
  color: string;
  className?: string;
  isPercentage?: boolean;
}

const MetricPieChart = ({ 
  value, 
  maxValue = 100, 
  title, 
  color, 
  className,
  isPercentage = false
}: MetricPieChartProps) => {
  const normalizedValue = Math.min(value, maxValue);
  const remainingValue = Math.max(0, maxValue - normalizedValue);
  
  const data = [
    { name: title, value: normalizedValue },
    { name: "Remaining", value: remainingValue }
  ];

  const COLORS = [color, "#2a3442"];
  
  const renderCustomLabel = () => {
    return (
      <text 
        x="50%" 
        y="50%" 
        textAnchor="middle" 
        dominantBaseline="middle"
        className="fill-white text-lg font-bold"
      >
        {isPercentage ? `${value}%` : value}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 p-2 rounded shadow-lg">
          <p className="text-white">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("h-24", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={25}
            outerRadius={35}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="none"
              />
            ))}
          </Pie>
          {renderCustomLabel()}
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricPieChart;
