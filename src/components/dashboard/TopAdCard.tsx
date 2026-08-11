import { Trophy, ImageOff } from "lucide-react";
import type { FbAd } from "@/services/facebookService";

interface Props {
  ads: FbAd[];
  isLoading: boolean;
}

const TopAdCard = ({ ads, isLoading }: Props) => {
  const activeAds = ads.filter(
    (a) => (a.ad_status || "").toUpperCase() === "ACTIVE" && Number(a.impressions) > 0
  );
  const top = [...activeAds].sort((a, b) => Number(b.ctr) - Number(a.ctr))[0];

  return (
    <div className="bg-zue-dark-light rounded-lg p-6 border border-gray-800 shadow-md h-full">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
        <Trophy size={20} className="text-zue-blue" />
        Top Performing Active Ad (by CTR)
      </h2>

      {isLoading ? (
        <div className="h-40 animate-pulse bg-gray-800/60 rounded" />
      ) : !top ? (
        <p className="text-gray-400 text-sm">
          No active ad data yet. Run a sync to pull ad creatives from your ad account.
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-48 shrink-0">
            {top.image_url || top.thumbnail_url ? (
              <img
                src={(top.image_url || top.thumbnail_url) as string}
                alt={top.ad_name ? `Creative for ${top.ad_name}` : "Top performing ad creative"}
                loading="lazy"
                className="w-full h-40 object-cover rounded border border-gray-800"
              />
            ) : (
              <div className="w-full h-40 flex items-center justify-center rounded border border-gray-800 bg-gray-900/60 text-gray-500">
                <ImageOff size={24} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{top.ad_name || "Untitled ad"}</p>
            {top.campaign_name && (
              <p className="text-gray-400 text-xs mb-2 truncate">{top.campaign_name}</p>
            )}
            {top.title && <p className="text-gray-200 text-sm font-semibold mb-1">{top.title}</p>}
            <p className="text-gray-400 text-sm whitespace-pre-line line-clamp-5">
              {top.body_copy || "No ad copy available."}
            </p>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div>
                <p className="text-xs text-gray-500">CTR</p>
                <p className="text-white font-semibold">{Number(top.ctr).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Clicks</p>
                <p className="text-white font-semibold">{Number(top.clicks).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Spend</p>
                <p className="text-white font-semibold">R{Number(top.spend).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopAdCard;
