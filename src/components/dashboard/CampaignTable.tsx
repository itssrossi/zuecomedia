
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { AdMetric } from "@/services/airtableService";

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

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-zue-dark-light hover:bg-zue-dark-light/80">
            <TableHead>Campaign</TableHead>
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
