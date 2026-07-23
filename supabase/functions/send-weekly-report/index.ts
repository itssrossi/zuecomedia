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

// Logo embedded as base64 so it always renders (no external hosting/CORS dependency)
const LOGO_B64 = "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";

function renderHtml(userName: string, range: { start: string; end: string }, totals: any, rows: any[]) {
  // --- Bar chart cells (campaign-level, by leads) ---
  const maxLeads = Math.max(1, ...rows.map((r) => r.leads || 0));
  const barCells = rows.map((r) => {
    const height = Math.round(((r.leads || 0) / maxLeads) * 80) + 10;
    return `
      <td width="${Math.max(10, Math.floor(100 / Math.max(rows.length, 1)))}%" style="text-align:center;vertical-align:bottom;padding:0 6px;">
        <div style="color:#5eead4;font-size:13px;font-weight:700;margin-bottom:4px;">${fmtNum(r.leads)}</div>
        <div style="height:${height}px;background:linear-gradient(180deg,#2dd4bf,#0d9488);border-radius:4px 4px 0 0;"></div>
      </td>`;
  }).join("");
  const barLabelCells = rows.map((r) => `
      <td width="${Math.max(10, Math.floor(100 / Math.max(rows.length, 1)))}%" style="text-align:center;color:#8b95a1;font-size:9px;padding-top:6px;word-break:break-word;">${r.name}</td>`
  ).join("");

  // --- Campaign breakdown table rows ---
  const rowsHtml = rows.map((r) => `
    <tr>
      <td style="padding:12px;border-top:1px solid #1c232c;color:#e5e7eb;font-size:13px;">${r.name}</td>
      <td style="padding:12px;border-top:1px solid #1c232c;color:#e5e7eb;font-size:13px;text-align:right;">${fmtNum(r.impressions)}</td>
      <td style="padding:12px;border-top:1px solid #1c232c;color:#e5e7eb;font-size:13px;text-align:right;">${fmtNum(r.clicks)}</td>
      <td style="padding:12px;border-top:1px solid #1c232c;color:#e5e7eb;font-size:13px;text-align:right;">${fmtMoney(r.spend)}</td>
      <td style="padding:12px;border-top:1px solid #1c232c;color:#e5e7eb;font-size:13px;text-align:right;">${fmtNum(r.leads)}</td>
      <td style="padding:12px;border-top:1px solid #1c232c;color:#e5e7eb;font-size:13px;text-align:right;">${(r.roas || 0).toFixed(2)}x</td>
    </tr>`).join("");

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0b0f14;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f14;padding:32px 0;">
<tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#10151c;border-radius:16px;overflow:hidden;border:1px solid #1c232c;">

  <!-- Header -->
  <tr><td style="padding:0;background:#10151c;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:28px 28px 24px 28px;background:linear-gradient(120deg,#0b0f14 40%,#0e3b3a 100%);border-bottom:1px solid #1c232c;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:52px;height:52px;background:#ffffff;border-radius:10px;text-align:center;vertical-align:middle;">
              <img src="data:image/png;base64,${LOGO_B64}" width="34" height="34" alt="Zue Co Media" style="display:inline-block;vertical-align:middle;"/>
            </td>
            <td style="padding-left:14px;">
              <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.01em;">Zue Co Media</div>
              <div style="color:#5eead4;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;margin-top:2px;">Weekly Ad Performance Report</div>
            </td>
          </tr></table>
          <div style="color:#9ca3af;font-size:13px;margin-top:16px;">${range.start} to ${range.end}</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:24px 28px 0 28px;">
    <p style="color:#d1d5db;font-size:14px;margin:0;">Hi ${userName || "there"}, here's your performance snapshot for the past week.</p>
  </td></tr>

  <!-- Stat cards -->
  <tr><td style="padding:20px 28px 4px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="25%" style="padding:6px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#151b23;border:1px solid #232b36;border-radius:10px;">
          <tr><td style="padding:14px;">
            <div style="color:#7dd3c0;font-size:16px;">&#128176;</div>
            <div style="color:#8b95a1;font-size:10px;text-transform:uppercase;letter-spacing:0.06em;margin-top:6px;">Ad Spend</div>
            <div style="color:#5eead4;font-size:19px;font-weight:700;margin-top:2px;">${fmtMoney(totals.spend)}</div>
          </td></tr>
        </table>
      </td>
      <td width="25%" style="padding:6px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#151b23;border:1px solid #232b36;border-radius:10px;">
          <tr><td style="padding:14px;">
            <div style="color:#7dd3c0;font-size:16px;">&#128200;</div>
            <div style="color:#8b95a1;font-size:10px;text-transform:uppercase;letter-spacing:0.06em;margin-top:6px;">Revenue</div>
            <div style="color:#34d399;font-size:19px;font-weight:700;margin-top:2px;">${fmtMoney(totals.revenue)}</div>
          </td></tr>
        </table>
      </td>
      <td width="25%" style="padding:6px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#151b23;border:1px solid #232b36;border-radius:10px;">
          <tr><td style="padding:14px;">
            <div style="color:#7dd3c0;font-size:16px;">&#128172;</div>
            <div style="color:#8b95a1;font-size:10px;text-transform:uppercase;letter-spacing:0.06em;margin-top:6px;">Leads</div>
            <div style="color:#fbbf24;font-size:19px;font-weight:700;margin-top:2px;">${fmtNum(totals.leads)}</div>
          </td></tr>
        </table>
      </td>
      <td width="25%" style="padding:6px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#151b23;border:1px solid #232b36;border-radius:10px;">
          <tr><td style="padding:14px;">
            <div style="color:#7dd3c0;font-size:16px;">&#127919;</div>
            <div style="color:#8b95a1;font-size:10px;text-transform:uppercase;letter-spacing:0.06em;margin-top:6px;">ROAS</div>
            <div style="color:#a78bfa;font-size:19px;font-weight:700;margin-top:2px;">${(totals.roas || 0).toFixed(2)}x</div>
          </td></tr>
        </table>
      </td>
    </tr></table>
  </td></tr>

  <!-- Bar chart -->
  <tr><td style="padding:24px 28px 4px 28px;">
    <div style="color:#e5e7eb;font-size:14px;font-weight:700;margin-bottom:4px;">
      <span style="color:#5eead4;">&#9650;</span>&nbsp; Campaign Lead Comparison
    </div>
  </td></tr>
  <tr><td style="padding:8px 28px 4px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0e131a;border:1px solid #232b36;border-radius:10px;">
      <tr><td style="padding:20px 20px 8px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          ${rows.length ? barCells : '<td style="text-align:center;color:#6b7280;font-size:12px;padding:20px 0;">No campaign activity in this period.</td>'}
        </tr></table>
      </td></tr>
      ${rows.length ? `<tr><td style="padding:0 20px 16px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${barLabelCells}</tr></table></td></tr>` : ""}
    </table>
  </td></tr>

  <!-- Campaign table -->
  <tr><td style="padding:24px 28px 4px 28px;">
    <div style="color:#e5e7eb;font-size:14px;font-weight:700;margin-bottom:10px;">Campaign Breakdown</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0e131a;border-radius:10px;border:1px solid #232b36;overflow:hidden;">
      <thead>
        <tr style="background:#151b23;">
          <th style="padding:10px 12px;color:#8b95a1;text-align:left;font-size:11px;text-transform:uppercase;">Campaign</th>
          <th style="padding:10px 12px;color:#8b95a1;text-align:right;font-size:11px;text-transform:uppercase;">Impr</th>
          <th style="padding:10px 12px;color:#8b95a1;text-align:right;font-size:11px;text-transform:uppercase;">Clicks</th>
          <th style="padding:10px 12px;color:#8b95a1;text-align:right;font-size:11px;text-transform:uppercase;">Spend</th>
          <th style="padding:10px 12px;color:#8b95a1;text-align:right;font-size:11px;text-transform:uppercase;">Leads</th>
          <th style="padding:10px 12px;color:#8b95a1;text-align:right;font-size:11px;text-transform:uppercase;">ROAS</th>
        </tr>
      </thead>
      <tbody>${rowsHtml || `<tr><td colspan="6" style="padding:20px;text-align:center;color:#6b7280;font-size:13px;">No campaign activity in this period.</td></tr>`}</tbody>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 28px 28px 28px;">
    <div style="height:1px;background:#1c232c;margin-bottom:16px;"></div>
    <div style="color:#5b6472;font-size:11px;text-align:center;">Sent automatically by Zue Co Media &middot; Weekly Ad Report</div>
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
