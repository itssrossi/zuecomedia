import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TileId =
  | "spend"
  | "revenue"
  | "roas"
  | "ctr"
  | "leads"
  | "cpc"
  | "impressions"
  | "clicks"
  | "whatsapp-messages"
  | "cost-per-whatsapp"
  | "top-ad"
  | "performance-chart"
  | "spend-pie"
  | "revenue-pie"
  | "leads-pie"
  | "campaign-table";

export const DEFAULT_TILES: TileId[] = [
  "spend",
  "revenue",
  "leads",
  "roas",
  "whatsapp-messages",
  "cost-per-whatsapp",
  "top-ad",
  "performance-chart",
  "spend-pie",
  "leads-pie",
  "campaign-table",
];

export const ALL_TILES: TileId[] = [
  "spend",
  "revenue",
  "roas",
  "ctr",
  "leads",
  "cpc",
  "impressions",
  "clicks",
  "whatsapp-messages",
  "cost-per-whatsapp",
  "top-ad",
  "performance-chart",
  "spend-pie",
  "revenue-pie",
  "leads-pie",
  "campaign-table",
];

export const useDashboardLayout = () => {
  const [tiles, setTiles] = useState<TileId[]>(DEFAULT_TILES);
  const [reportEmail, setReportEmail] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }
      setUserId(user.id);
      const { data } = await (supabase as any)
        .from("dashboard_layouts")
        .select("tiles, report_email")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        if (Array.isArray(data.tiles) && data.tiles.length) {
          const validTiles = data.tiles.filter((tile: unknown): tile is TileId =>
            typeof tile === "string" && ALL_TILES.includes(tile as TileId)
          );
          const newFacebookTiles: TileId[] = ["whatsapp-messages", "cost-per-whatsapp", "top-ad"];
          const upgradedTiles = [
            ...validTiles,
            ...newFacebookTiles.filter((tile) => !validTiles.includes(tile)),
          ];
          setTiles(upgradedTiles);

          if (upgradedTiles.length !== validTiles.length) {
            await (supabase as any)
              .from("dashboard_layouts")
              .update({ tiles: upgradedTiles, updated_at: new Date().toISOString() })
              .eq("user_id", user.id);
          }
        }
        if (data.report_email) setReportEmail(data.report_email);
      }
      setIsLoading(false);
    })();
  }, []);

  const persist = useCallback(async (nextTiles: TileId[], nextEmail?: string) => {
    if (!userId) return;
    await (supabase as any)
      .from("dashboard_layouts")
      .upsert({
        user_id: userId,
        tiles: nextTiles,
        report_email: nextEmail ?? reportEmail,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
  }, [userId, reportEmail]);

  const updateTiles = useCallback((next: TileId[]) => {
    setTiles(next);
    persist(next);
  }, [persist]);

  const updateReportEmail = useCallback(async (email: string) => {
    setReportEmail(email);
    await persist(tiles, email);
  }, [persist, tiles]);

  return { tiles, updateTiles, reportEmail, updateReportEmail, isLoading };
};