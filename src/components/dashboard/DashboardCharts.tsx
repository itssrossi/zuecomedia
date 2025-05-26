
import { BarChart4 } from "lucide-react";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import CampaignPieChart from "@/components/dashboard/CampaignPieChart";
import CampaignTable from "@/components/dashboard/CampaignTable";
import type { AdMetric } from "@/hooks/useFacebookData";

interface DashboardChartsProps {
  metrics: AdMetric[];
  isLoading: boolean;
}

const DashboardCharts = ({ metrics, isLoading }: DashboardChartsProps) => {
  return (
    <>
      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <PerformanceChart data={metrics} isLoading={isLoading} />
        </div>
        <div>
          <CampaignPieChart 
            data={metrics} 
            isLoading={isLoading} 
            metric="spend" 
            title="Ad Spend Distribution"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CampaignPieChart 
          data={metrics} 
          isLoading={isLoading} 
          metric="revenue" 
          title="Revenue Distribution"
        />
        <CampaignPieChart 
          data={metrics} 
          isLoading={isLoading} 
          metric="conversions" 
          title="Conversions Distribution"
        />
      </section>

      {/* Campaign Table Section */}
      <section className="bg-zue-dark-light rounded-lg p-6 border border-gray-800 shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart4 size={20} className="text-zue-blue" />
          Facebook Ad Campaigns
        </h2>
        <CampaignTable campaigns={metrics} isLoading={isLoading} />
      </section>
    </>
  );
};

export default DashboardCharts;
