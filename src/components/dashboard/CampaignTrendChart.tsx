
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface CampaignTrendChartProps {
  data: { name: string; value: number }[];
  color: string;
  height?: number;
  showAxis?: boolean;
}

const CampaignTrendChart = ({ 
  data, 
  color, 
  height = 50, 
  showAxis = false 
}: CampaignTrendChartProps) => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: "#1E293B", strokeWidth: 2 }}
          />
          {showAxis && (
            <>
              <XAxis 
                dataKey="name" 
                tick={{ fill: "#9CA3AF", fontSize: 10 }} 
                axisLine={{ stroke: "#374151" }}
              />
              <YAxis 
                tick={{ fill: "#9CA3AF", fontSize: 10 }} 
                axisLine={{ stroke: "#374151" }}
              />
            </>
          )}
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#1F2937", 
              borderColor: "#4B5563", 
              color: "#F9FAFB" 
            }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CampaignTrendChart;
