
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AdMetric } from "@/hooks/useFacebookData";

interface CampaignTableProps {
  campaigns: AdMetric[];
  isLoading: boolean;
}

const CampaignTable = ({ campaigns, isLoading }: CampaignTableProps) => {
  if (isLoading) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        <p className="text-gray-400">Loading campaigns data...</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        <p className="text-gray-400">No campaign data available</p>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500 hover:bg-green-600';
      case 'PAUSED':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'ARCHIVED':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'DELETED':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-zue-dark-light hover:bg-zue-dark-light/80">
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-right">Impressions</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">CTR</TableHead>
            <TableHead className="text-right">Spend</TableHead>
            <TableHead className="text-right">Conversions</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">ROAS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id} className="border-b border-gray-800 hover:bg-zue-dark-light/50">
              <TableCell className="font-medium">{campaign.campaign}</TableCell>
              <TableCell>
                <Badge className={`text-white ${getStatusBadgeColor(campaign.status || 'UNKNOWN')}`}>
                  {campaign.status || 'UNKNOWN'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(campaign.start_time)}</TableCell>
              <TableCell>{formatDate(campaign.stop_time)}</TableCell>
              <TableCell className="text-right">{campaign.impressions.toLocaleString()}</TableCell>
              <TableCell className="text-right">{campaign.clicks.toLocaleString()}</TableCell>
              <TableCell className="text-right">{campaign.ctr.toFixed(2)}%</TableCell>
              <TableCell className="text-right">${campaign.spend.toLocaleString()}</TableCell>
              <TableCell className="text-right">{campaign.conversions.toLocaleString()}</TableCell>
              <TableCell className="text-right">${campaign.revenue.toLocaleString()}</TableCell>
              <TableCell className="text-right">{campaign.roas.toFixed(2)}x</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CampaignTable;
