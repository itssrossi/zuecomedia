import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const fmtMoney = (n: number) => `R${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const fmtNum = (n: number) => (n || 0).toLocaleString();

function renderHtml(userName: string, range: { start: string; end: string }, totals: any, rows: any[]) {
  const rowsHtml = rows.map((r) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #1f2937;color:#e5e7eb;">${r.name}</td>
      <td style="padding:12px;border-bottom:1px solid #1f2937;color:#e5e7eb;text-align:right;">${fmtNum(r.impressions)}</td>
      <td style="padding:12px;border-bottom:1px solid #1f2937;color:#e5e7eb;text-align:right;">${fmtNum(r.clicks)}</td>
      <td style="padding:12px;border-bottom:1px solid #1f2937;color:#e5e7eb;text-align:right;">${fmtMoney(r.spend)}</td>
      <td style="padding:12px;border-bottom:1px solid #1f2937;color:#e5e7eb;text-align:right;">${fmtNum(r.leads)}</td>
      <td style="padding:12px;border-bottom:1px solid #1f2937;color:#e5e7eb;text-align:right;">${fmtMoney(r.revenue)}</td>
      <td style="padding:12px;border-bottom:1px solid #1f2937;color:#e5e7eb;text-align:right;">${(r.roas || 0).toFixed(2)}x</td>
    </tr>`).join("");

  const stat = (label: string, value: string, color: string) => `
    <td style="padding:16px;background:#111827;border:1px solid #1f2937;border-radius:10px;width:25%;">
      <div style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">${label}</div>
      <div style="color:${color};font-size:22px;font-weight:700;margin-top:6px;">${value}</div>
    </td>`;

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0b1120;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1120;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:14px;overflow:hidden;">
        <tr><td style="padding:24px 28px;background:linear-gradient(135deg,#1e3a8a,#3182CE);">
          <div style="color:#fff;font-size:22px;font-weight:700;">Zueco Media &mdash; Weekly Ad Report</div>
          <div style="color:#dbeafe;font-size:13px;margin-top:4px;">${range.start} &rarr; ${range.end}</div>
        </td></tr>
        <tr><td style="padding:24px 28px;">
          <p style="color:#e5e7eb;font-size:15px;margin:0 0 16px 0;">Hi ${userName || "there"}, here's your performance snapshot for the past week.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="8">
            <tr>
              ${stat("Ad Spend", fmtMoney(totals.spend), "#60a5fa")}
              ${stat("Revenue", fmtMoney(totals.revenue), "#34d399")}
              ${stat("Leads", fmtNum(totals.leads), "#fbbf24")}
              ${stat("ROAS", `${(totals.roas || 0).toFixed(2)}x`, "#a78bfa")}
            </tr>
          </table>
          <h3 style="color:#e5e7eb;font-size:16px;margin:24px 0 12px 0;">Campaigns</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1120;border-radius:10px;border:1px solid #1f2937;">
            <thead>
              <tr style="background:#111827;">
                <th style="padding:12px;color:#9ca3af;text-align:left;font-size:12px;">Campaign</th>
                <th style="padding:12px;color:#9ca3af;text-align:right;font-size:12px;">Impr</th>
                <th style="padding:12px;color:#9ca3af;text-align:right;font-size:12px;">Clicks</th>
                <th style="padding:12px;color:#9ca3af;text-align:right;font-size:12px;">Spend</th>
                <th style="padding:12px;color:#9ca3af;text-align:right;font-size:12px;">Leads</th>
                <th style="padding:12px;color:#9ca3af;text-align:right;font-size:12px;">Revenue</th>
                <th style="padding:12px;color:#9ca3af;text-align:right;font-size:12px;">ROAS</th>
              </tr>
            </thead>
            <tbody>${rowsHtml || `<tr><td colspan="7" style="padding:20px;text-align:center;color:#9ca3af;">No campaign activity in this period.</td></tr>`}</tbody>
          </table>
        </td></tr>
        <tr><td style="padding:16px 28px;background:#0b1120;color:#6b7280;font-size:12px;text-align:center;">
          Sent automatically by Zueco Media Dashboard
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function processUser(admin: any, userId: string, overrideEmail?: string) {
  const { data: layout } = await admin
    .from("dashboard_layouts")
    .select("report_email")
    .eq("user_id", userId)
    .maybeSingle();
  const toEmail = overrideEmail || layout?.report_email;
  if (!toEmail) return { userId, skipped: "no report_email set" };

  const { data: profile } = await admin.from("profiles").select("full_name, email").eq("id", userId).maybeSingle();

  const end = new Date();
  const start = new Date(); start.setDate(end.getDate() - 7);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  const { data: metrics } = await admin
    .from("fb_ad_metrics")
    .select("*, fb_campaigns!inner(campaign_name)")
    .eq("user_id", userId)
    .gte("date", startStr)
    .lte("date", endStr);

  const grouped: Record<string, any> = {};
  for (const m of metrics || []) {
    const name = m.fb_campaigns?.campaign_name || "Unknown";
    if (!grouped[name]) grouped[name] = { name, impressions: 0, clicks: 0, spend: 0, leads: 0, revenue: 0 };
    grouped[name].impressions += Number(m.impressions || 0);
    grouped[name].clicks += Number(m.clicks || 0);
    grouped[name].spend += Number(m.spend || 0);
    grouped[name].leads += Number(m.conversions || 0);
    grouped[name].revenue += Number(m.revenue || 0);
  }
  const rows = Object.values(grouped).map((r: any) => ({ ...r, roas: r.spend > 0 ? r.revenue / r.spend : 0 }));
  const totals = rows.reduce((a: any, r: any) => ({
    spend: a.spend + r.spend, revenue: a.revenue + r.revenue, leads: a.leads + r.leads,
  }), { spend: 0, revenue: 0, leads: 0 });
  (totals as any).roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;

  const html = renderHtml(profile?.full_name || "", { start: startStr, end: endStr }, totals, rows);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Zue Co Media Reports <jrsnell@zuecomedia.com>",
      to: [toEmail],
      subject: `Weekly Ad Report — ${startStr} to ${endStr}`,
      html,
    }),
  });
  const bodyText = await res.text();
  if (!res.ok) return { userId, error: `Resend ${res.status}: ${bodyText}` };
  return { userId, sent: true, to: toEmail };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const url = new URL(req.url);
    const cronKey = req.headers.get("x-cron-key") || url.searchParams.get("cron_key");
    const runAll = cronKey && cronKey === Deno.env.get("CRON_SECRET");

    if (runAll) {
      const { data: layouts } = await admin
        .from("dashboard_layouts")
        .select("user_id, report_email")
        .not("report_email", "is", null);
      const results = [];
      for (const l of layouts || []) {
        results.push(await processUser(admin, l.user_id, l.report_email));
      }
      return new Response(JSON.stringify({ ok: true, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: cErr } = await admin.auth.getClaims(token);
    if (cErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const result = await processUser(admin, claims.claims.sub);
    const status = (result as any).error ? 500 : 200;
    return new Response(JSON.stringify(result), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("send-weekly-report error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
