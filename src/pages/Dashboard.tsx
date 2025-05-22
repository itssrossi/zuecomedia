
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/dashboard/DashboardCard";
import CampaignTable from "@/components/dashboard/CampaignTable";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import CampaignPieChart from "@/components/dashboard/CampaignPieChart";
import MetricPieChart from "@/components/dashboard/MetricPieChart";
import CampaignTrendChart from "@/components/dashboard/CampaignTrendChart";
import { fetchAdMetrics, fetchTotalStats, AdMetric } from "@/services/airtableService";
import { toast } from "@/components/ui/sonner";
import { 
  BarChart4, 
  DollarSign, 
  TrendingUp, 
  LineChart, 
  BarChart, 
  PieChart,
  Users, 
  MousePointerClick
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<AdMetric[]>([]);
  const [stats, setStats] = useState({
    totalSpend: 0,
    totalRevenue: 0,
    averageRoas: 0,
    totalImpressions: 0,
    totalClicks: 0,
    averageCtr: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sample trend data
  const spendTrendData = [
    { name: "Jan", value: 1000 },
    { name: "Feb", value: 1200 },
    { name: "Mar", value: 900 },
    { name: "Apr", value: 1500 },
    { name: "May", value: 1700 },
    { name: "Jun", value: 1400 },
    { name: "Jul", value: 1800 },
  ];

  const revenueTrendData = [
    { name: "Jan", value: 3000 },
    { name: "Feb", value: 3600 },
    { name: "Mar", value: 2700 },
    { name: "Apr", value: 5200 },
    { name: "May", value: 6800 },
    { name: "Jun", value: 7000 },
    { name: "Jul", value: 8500 },
  ];

  const roasTrendData = [
    { name: "Jan", value: 3.0 },
    { name: "Feb", value: 3.2 },
    { name: "Mar", value: 3.0 },
    { name: "Apr", value: 3.5 },
    { name: "May", value: 4.0 },
    { name: "Jun", value: 5.0 },
    { name: "Jul", value: 4.8 },
  ];

  const ctrTrendData = [
    { name: "Jan", value: 2.1 },
    { name: "Feb", value: 2.5 },
    { name: "Mar", value: 3.0 },
    { name: "Apr", value: 3.8 },
    { name: "May", value: 4.2 },
    { name: "Jun", value: 3.9 },
    { name: "Jul", value: 4.5 },
  ];

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      toast.error("Please log in to access the dashboard");
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [metricsData, statsData] = await Promise.all([
          fetchAdMetrics(),
          fetchTotalStats(),
        ]);
        setCampaigns(metricsData);
        setStats(statsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-zue-dark text-white">
      {/* Dashboard Header */}
      <header className="bg-zue-dark-light shadow-md py-4 px-6 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              src="/lovable-uploads/d341fa26-afd0-418c-9c97-902fff2b93e2.png"
              alt="Zue Co Media Logo"
              className="h-8"
            />
            <h1 className="text-xl font-bold">
              Zue<span className="text-zue-blue">Co</span> Analytics Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="border-gray-600 text-white hover:bg-zue-dark hover:text-white"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Key Metrics Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Ad Spend"
            value={`$${stats.totalSpend.toLocaleString()}`}
            icon={<DollarSign size={20} />}
            trend={{ value: 12.5, isPositive: true }}
            chartComponent={<CampaignTrendChart data={spendTrendData} color="#3182CE" />}
          />
          <DashboardCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={<TrendingUp size={20} />}
            trend={{ value: 18.3, isPositive: true }}
            chartComponent={<CampaignTrendChart data={revenueTrendData} color="#38A169" />}
          />
          <DashboardCard
            title="Average ROAS"
            value={`${stats.averageRoas.toFixed(2)}x`}
            icon={<BarChart4 size={20} />}
            trend={{ value: 5.2, isPositive: true }}
            chartComponent={
              <MetricPieChart 
                value={Math.round(stats.averageRoas * 100) / 100} 
                maxValue={10}
                title="ROAS"
                color="#38A169"
              />
            }
          />
          <DashboardCard
            title="Average CTR"
            value={`${stats.averageCtr.toFixed(2)}%`}
            icon={<MousePointerClick size={20} />}
            trend={{ value: 0.8, isPositive: true }}
            chartComponent={
              <MetricPieChart 
                value={Math.round(stats.averageCtr * 10) / 10}
                maxValue={10}
                title="CTR"
                color="#3182CE"
                isPercentage
              />
            }
          />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PerformanceChart data={campaigns} isLoading={isLoading} />
          </div>
          <div>
            <CampaignPieChart 
              data={campaigns} 
              isLoading={isLoading} 
              metric="spend" 
              title="Ad Spend Distribution"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CampaignPieChart 
            data={campaigns} 
            isLoading={isLoading} 
            metric="revenue" 
            title="Revenue Distribution"
          />
          <CampaignPieChart 
            data={campaigns} 
            isLoading={isLoading} 
            metric="conversions" 
            title="Conversions Distribution"
          />
        </section>

        {/* Campaign Table Section */}
        <section className="bg-zue-dark-light rounded-lg p-6 border border-gray-800 shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart size={20} className="text-zue-blue" />
            Facebook Ad Campaigns
          </h2>
          <CampaignTable campaigns={campaigns} isLoading={isLoading} />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
