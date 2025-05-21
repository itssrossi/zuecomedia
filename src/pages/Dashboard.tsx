
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/dashboard/DashboardCard";
import CampaignTable from "@/components/dashboard/CampaignTable";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import { fetchAdMetrics, fetchTotalStats, AdMetric } from "@/services/airtableService";
import { toast } from "@/components/ui/sonner";
import { LogIn, BarChart } from "lucide-react";

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
      <header className="bg-zue-dark-light shadow-md py-4 px-6">
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
          <Button
            variant="outline"
            className="border-gray-600 text-white hover:bg-zue-dark hover:text-white"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Ad Spend"
            value={`$${stats.totalSpend.toLocaleString()}`}
            icon={<BarChart size={20} />}
          />
          <DashboardCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={<BarChart size={20} />}
          />
          <DashboardCard
            title="Average ROAS"
            value={`${stats.averageRoas.toFixed(2)}x`}
            icon={<BarChart size={20} />}
          />
          <DashboardCard
            title="Average CTR"
            value={`${stats.averageCtr.toFixed(2)}%`}
            icon={<BarChart size={20} />}
          />
        </section>

        <section className="mb-8 bg-zue-dark-light rounded-lg p-6 border border-gray-800 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Campaign Performance</h2>
          <PerformanceChart data={campaigns} isLoading={isLoading} />
        </section>

        <section className="bg-zue-dark-light rounded-lg p-6 border border-gray-800 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Facebook Ad Campaigns</h2>
          <CampaignTable campaigns={campaigns} isLoading={isLoading} />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
