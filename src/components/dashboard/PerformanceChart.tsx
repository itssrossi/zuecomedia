
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
  LineChart,
  Line,
} from "recharts";
import type { AdMetric } from "@/services/airtableService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface PerformanceChartProps {
  data: AdMetric[];
  isLoading: boolean;
}

const PerformanceChart = ({ data, isLoading }: PerformanceChartProps) => {
  const isMobile = useIsMobile();
  
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: isMobile ? item.campaign.slice(0, 15) + '...' : item.campaign, // Truncate on mobile
      fullName: item.campaign, // Keep full name for tooltip
      spend: item.spend,
      revenue: item.revenue,
      clicks: item.clicks,
      impressions: item.impressions / 100, // Scale down for better visualization
      roas: item.roas,
    }));
  }, [data, isMobile]);

  if (isLoading) {
    return (
      <Card className="bg-zue-dark-light border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Campaign Performance</CardTitle>
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
          <CardTitle className="text-white">Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 flex items-center justify-center">
            <p className="text-gray-400">No performance data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartHeight = isMobile ? 280 : 350;
  const bottomMargin = isMobile ? 80 : 60;

  return (
    <Card className="bg-zue-dark-light border-gray-800">
      <CardHeader>
        <CardTitle className="text-white text-sm sm:text-base">Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <Tabs defaultValue="barChart" className="space-y-4">
          <TabsList className="bg-zue-dark border-gray-700 grid w-full grid-cols-2">
            <TabsTrigger 
              value="barChart" 
              className="data-[state=active]:bg-zue-dark-light data-[state=active]:text-white text-xs sm:text-sm"
            >
              Bar Chart
            </TabsTrigger>
            <TabsTrigger 
              value="lineChart" 
              className="data-[state=active]:bg-zue-dark-light data-[state=active]:text-white text-xs sm:text-sm"
            >
              Line Chart
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="barChart" className="space-y-4">
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: isMobile ? 10 : 30,
                  left: isMobile ? 10 : 20,
                  bottom: bottomMargin,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={isMobile ? -90 : -45}
                  textAnchor="end" 
                  tick={{ fill: "#9CA3AF", fontSize: isMobile ? 10 : 12 }} 
                  height={bottomMargin}
                  axisLine={{ stroke: "#4B5563" }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fill: "#9CA3AF", fontSize: isMobile ? 10 : 12 }}
                  axisLine={{ stroke: "#4B5563" }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#1F2937", 
                    borderColor: "#4B5563", 
                    color: "#F9FAFB",
                    fontSize: isMobile ? "12px" : "14px"
                  }}
                  formatter={(value, name, props) => [
                    value,
                    name,
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullName;
                    }
                    return label;
                  }}
                />
                <Legend 
                  wrapperStyle={{ 
                    color: "#9CA3AF", 
                    fontSize: isMobile ? "12px" : "14px",
                    paddingTop: "10px"
                  }} 
                />
                <Bar dataKey="spend" name="Ad Spend ($)" fill="#3182CE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue ($)" fill="#38A169" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="lineChart">
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: isMobile ? 10 : 30,
                  left: isMobile ? 10 : 20,
                  bottom: bottomMargin,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  angle={isMobile ? -90 : -45}
                  textAnchor="end" 
                  tick={{ fill: "#9CA3AF", fontSize: isMobile ? 10 : 12 }} 
                  height={bottomMargin}
                  axisLine={{ stroke: "#4B5563" }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fill: "#9CA3AF", fontSize: isMobile ? 10 : 12 }}
                  axisLine={{ stroke: "#4B5563" }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#1F2937", 
                    borderColor: "#4B5563", 
                    color: "#F9FAFB",
                    fontSize: isMobile ? "12px" : "14px"
                  }}
                  formatter={(value, name, props) => [
                    value,
                    name,
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullName;
                    }
                    return label;
                  }}
                />
                <Legend 
                  wrapperStyle={{ 
                    color: "#9CA3AF", 
                    fontSize: isMobile ? "12px" : "14px",
                    paddingTop: "10px"
                  }} 
                />
                <Line type="monotone" dataKey="clicks" stroke="#0EA5E9" activeDot={{ r: 6 }} strokeWidth={2} />
                <Line type="monotone" dataKey="impressions" stroke="#A855F7" activeDot={{ r: 6 }} strokeWidth={2} />
                <Line type="monotone" dataKey="roas" stroke="#10B981" activeDot={{ r: 6 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
