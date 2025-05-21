
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AdMetric } from "@/services/airtableService";

interface PerformanceChartProps {
  data: AdMetric[];
  isLoading: boolean;
}

const PerformanceChart = ({ data, isLoading }: PerformanceChartProps) => {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.campaign,
      spend: item.spend,
      revenue: item.revenue,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-gray-400">Loading chart data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-gray-400">No performance data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          tick={{ fill: "#9CA3AF" }} 
          height={80} 
        />
        <YAxis tick={{ fill: "#9CA3AF" }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "#1F2937", 
            borderColor: "#4B5563", 
            color: "#F9FAFB" 
          }} 
        />
        <Legend wrapperStyle={{ color: "#9CA3AF" }} />
        <Bar dataKey="spend" name="Ad Spend ($)" fill="#3182CE" />
        <Bar dataKey="revenue" name="Revenue ($)" fill="#38A169" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;
