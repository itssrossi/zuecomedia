
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdMetric } from "@/hooks/useFacebookData";

interface CampaignPieChartProps {
  data: AdMetric[];
  isLoading: boolean;
  metric: keyof Pick<AdMetric, "spend" | "revenue" | "conversions">;
  title: string;
}

const CampaignPieChart = ({ data, isLoading, metric, title }: CampaignPieChartProps) => {
  const chartData = data.map((item) => ({
    name: item.campaign,
    value: item[metric],
  }));

  const COLORS = ["#3182CE", "#38A169", "#E53E3E", "#805AD5", "#DD6B20", "#319795"];

  if (isLoading) {
    return (
      <Card className="bg-zue-dark-light border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 flex items-center justify-center">
            <p className="text-gray-400">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="bg-zue-dark-light border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 flex items-center justify-center">
            <p className="text-gray-400">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTooltipValue = (value: number) => {
    if (metric === "spend" || metric === "revenue") {
      return `R${value}`;
    }
    return value.toString();
  };
  const metricLabel = metric === "conversions" ? "Leads" : metric.charAt(0).toUpperCase() + metric.slice(1);

  return (
    <Card className="bg-zue-dark-light border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatTooltipValue(Number(value)), metricLabel]}
              contentStyle={{
                backgroundColor: "#1F2937",
                borderColor: "#4B5563",
                color: "#F9FAFB",
              }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              formatter={(value) => <span className="text-gray-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CampaignPieChart;
