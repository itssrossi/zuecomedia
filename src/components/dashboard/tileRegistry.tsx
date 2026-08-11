import { ReactNode } from "react";
import { DollarSign, TrendingUp, BarChart4, MousePointerClick, Users, Eye, MousePointer, Target, PieChart, LineChart, Table as TableIcon, MessageCircle, Trophy } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import CampaignTrendChart from "@/components/dashboard/CampaignTrendChart";
import MetricPieChart from "@/components/dashboard/MetricPieChart";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import CampaignPieChart from "@/components/dashboard/CampaignPieChart";
import CampaignTable from "@/components/dashboard/CampaignTable";
import TopAdCard from "@/components/dashboard/TopAdCard";
import type { AdMetric, DashboardStats } from "@/hooks/useFacebookData";
import type { FbAd } from "@/services/facebookService";
import type { TileId } from "@/hooks/useDashboardLayout";

const fmtMoney = (n: number) => {
  if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `R${(n / 1_000).toFixed(1)}k`;
  return `R${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};
const fmtNum = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
};

export interface TileMeta {
  id: TileId;
  title: string;
  icon: ReactNode;
  size: "sm" | "lg";
}

export const TILE_META: Record<TileId, TileMeta> = {
  spend:            { id: "spend",             title: "Total Ad Spend",  icon: <DollarSign size={16} />,        size: "sm" },
  revenue:          { id: "revenue",           title: "Total Revenue",   icon: <TrendingUp size={16} />,        size: "sm" },
  roas:             { id: "roas",              title: "Average ROAS",    icon: <BarChart4 size={16} />,         size: "sm" },
  ctr:              { id: "ctr",               title: "Average CTR",     icon: <MousePointerClick size={16} />, size: "sm" },
  leads:            { id: "leads",             title: "Leads Generated", icon: <Users size={16} />,             size: "sm" },
  cpc:              { id: "cpc",               title: "Average CPC",     icon: <Target size={16} />,            size: "sm" },
  impressions:      { id: "impressions",       title: "Impressions",     icon: <Eye size={16} />,               size: "sm" },
  clicks:           { id: "clicks",            title: "Clicks",          icon: <MousePointer size={16} />,      size: "sm" },
  "whatsapp-messages":  { id: "whatsapp-messages",  title: "WhatsApp Messages",       icon: <MessageCircle size={16} />, size: "sm" },
  "cost-per-whatsapp":  { id: "cost-per-whatsapp",  title: "Cost per WhatsApp Msg",   icon: <MessageCircle size={16} />, size: "sm" },
  "top-ad":             { id: "top-ad",             title: "Top Performing Ad",       icon: <Trophy size={16} />,        size: "lg" },
  "performance-chart": { id: "performance-chart", title: "Campaign Performance", icon: <LineChart size={16} />, size: "lg" },
  "spend-pie":      { id: "spend-pie",         title: "Spend Distribution",   icon: <PieChart size={16} />,     size: "lg" },
  "revenue-pie":    { id: "revenue-pie",       title: "Revenue Distribution", icon: <PieChart size={16} />,     size: "lg" },
  "leads-pie":      { id: "leads-pie",         title: "Leads Distribution",   icon: <PieChart size={16} />,     size: "lg" },
  "campaign-table": { id: "campaign-table",    title: "Campaigns Table",      icon: <TableIcon size={16} />,    size: "lg" },
};

interface Ctx {
  metrics: AdMetric[];
  stats: DashboardStats;
  isLoading: boolean;
  ads: FbAd[];
  trends: {
    spendTrendData: { name: string; value: number }[];
    revenueTrendData: { name: string; value: number }[];
    roasTrendData: { name: string; value: number }[];
    ctrTrendData: { name: string; value: number }[];
  };
}

export const renderTile = (id: TileId, ctx: Ctx): ReactNode => {
  const { stats, metrics, isLoading, trends, ads } = ctx;
  const totalLeads = metrics.reduce((s, m) => s + Number(m.conversions || 0), 0);
  switch (id) {
    case "spend":
      return <DashboardCard title="Total Ad Spend" value={fmtMoney(stats.totalSpend)} icon={<DollarSign size={20} />} chartComponent={<CampaignTrendChart data={trends.spendTrendData} color="#3182CE" />} />;
    case "revenue":
      return <DashboardCard title="Total Revenue" value={fmtMoney(stats.totalRevenue)} icon={<TrendingUp size={20} />} chartComponent={<CampaignTrendChart data={trends.revenueTrendData} color="#38A169" />} />;
    case "roas":
      return <DashboardCard title="Average ROAS" value={`${stats.averageRoas.toFixed(2)}x`} icon={<BarChart4 size={20} />} chartComponent={<MetricPieChart value={Math.round(stats.averageRoas * 100) / 100} maxValue={10} title="ROAS" color="#38A169" />} />;
    case "ctr":
      return <DashboardCard title="Average CTR" value={`${stats.averageCtr.toFixed(2)}%`} icon={<MousePointerClick size={20} />} chartComponent={<MetricPieChart value={Math.round(stats.averageCtr * 10) / 10} maxValue={10} title="CTR" color="#3182CE" isPercentage />} />;
    case "leads":
      return <DashboardCard title="Leads Generated" value={fmtNum(totalLeads)} icon={<Users size={20} />} />;
    case "cpc":
      return <DashboardCard title="Average CPC" value={`R${stats.averageCpc.toFixed(2)}`} icon={<Target size={20} />} />;
    case "impressions":
      return <DashboardCard title="Impressions" value={fmtNum(stats.totalImpressions)} icon={<Eye size={20} />} />;
    case "clicks":
      return <DashboardCard title="Clicks" value={fmtNum(stats.totalClicks)} icon={<MousePointer size={20} />} />;
    case "whatsapp-messages":
      return <DashboardCard title="WhatsApp Messages" value={fmtNum(stats.totalMessages)} icon={<MessageCircle size={20} />} />;
    case "cost-per-whatsapp":
      return <DashboardCard title="Cost per WhatsApp Msg" value={`R${stats.costPerMessage.toFixed(2)}`} icon={<MessageCircle size={20} />} />;
    case "top-ad":
      return <TopAdCard ads={ads} isLoading={isLoading} />;
    case "performance-chart":
      return <PerformanceChart data={metrics} isLoading={isLoading} />;
    case "spend-pie":
      return <CampaignPieChart data={metrics} isLoading={isLoading} metric="spend" title="Spend Distribution" />;
    case "revenue-pie":
      return <CampaignPieChart data={metrics} isLoading={isLoading} metric="revenue" title="Revenue Distribution" />;
    case "leads-pie":
      return <CampaignPieChart data={metrics} isLoading={isLoading} metric="conversions" title="Leads Distribution" />;
    case "campaign-table":
      return (
        <div className="bg-zue-dark-light rounded-lg p-6 border border-gray-800 shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <TableIcon size={20} className="text-zue-blue" />
            Campaigns
          </h2>
          <CampaignTable campaigns={metrics} isLoading={isLoading} />
        </div>
      );
  }
};