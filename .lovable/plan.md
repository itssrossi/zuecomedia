## What I'll build

### 1. Cleaner dashboard + remove Voice Assistant
- Delete `RealtimeVoiceAssistant` from `Dashboard.tsx` (component files stay on disk, just unmounted).
- Redesign metric tiles with larger typography, better spacing, clearer hierarchy, formatted numbers (compact for large values, e.g. R12.5k).
- Reorganize section so charts + table breathe more.

### 2. Campaign filter (single-select + All)
- Add a `Select` dropdown in `DashboardControls` listing campaigns from `useFacebookData().campaigns` with an "All Campaigns" option.
- Dashboard passes the chosen `campaignId` (or `[]` for all) into `useFacebookData`.

### 3. Conversions = Leads
- Rename "Conversions" tile/labels to "Leads" throughout dashboard (metrics tile, pie chart title, table column). Underlying `conversions` field unchanged.

### 4. Movable + add/remove tiles (saved per user)
- New table `dashboard_layouts (user_id uuid PK, tiles jsonb, report_email text, updated_at timestamptz)` with RLS + grants.
- Tile registry: spend, revenue, roas, ctr, leads, cpc, impressions, clicks, performance-chart, spend-pie, revenue-pie, leads-pie, campaign-table. Each has an id, title, size (sm/lg).
- Use `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop reordering.
- "Customize" button toggles edit mode: shows remove ✕ on each tile and an "+ Add tile" menu of hidden tiles.
- Layout auto-saves to `dashboard_layouts` on change; loaded on mount; sensible default if none.

### 5. Weekly email report
- Settings page (`NurturingSettings.tsx` or new `Settings` section): input for "Report email address" saved to `dashboard_layouts.report_email` (or profiles).
- Edge function `send-weekly-report`:
  - Auth via service role; accepts `{ user_id }` or runs for all users when triggered by cron.
  - Pulls last 7 days of `fb_ad_metrics` joined with `fb_campaigns` for the user's account.
  - Renders a branded HTML template (Zueco dark theme, metric cards, campaign table).
  - Sends via existing Resend `RESEND_API_KEY` secret.
- "Send Report Now" button on dashboard invokes it with current user.
- pg_cron job runs every Monday 07:00 (UTC) invoking the function per user with a `report_email` set.

### 6. Migration script
- Append to `database/REBUILD_DATABASE.sql`: new table, RLS, grants, and pg_cron schedule for the Monday job. User runs it in Supabase SQL editor. Instructions include deploying `send-weekly-report`.

## Files touched
- `src/pages/Dashboard.tsx` — remove voice assistant, wire campaign filter + customizable grid + send-report button.
- `src/components/dashboard/DashboardControls.tsx` — add campaign `Select`.
- `src/components/dashboard/DashboardMetrics.tsx` — refactored to render from tile registry.
- New `src/components/dashboard/CustomizableGrid.tsx` — dnd-kit sortable grid, add/remove UI.
- New `src/components/dashboard/tileRegistry.tsx` — tile definitions + renderers.
- New `src/hooks/useDashboardLayout.ts` — load/save layout + report_email.
- `src/pages/NurturingSettings.tsx` — add "Weekly Report Email" input.
- `src/components/dashboard/CampaignTable.tsx` — rename Conversions → Leads.
- `src/components/dashboard/CampaignPieChart.tsx` — support `metric="leads"` label.
- New `supabase/functions/send-weekly-report/index.ts` (verify_jwt off; validates user).
- `database/REBUILD_DATABASE.sql` — append table + cron.
- `package.json` — add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.

## Manual steps you'll need to do (external Supabase)
1. Run the appended SQL in Supabase SQL editor.
2. In Supabase → Edge Functions, create `send-weekly-report` with Verify JWT **OFF** and paste the file's contents; ensure `RESEND_API_KEY` secret exists.
3. Set your report email in Settings.

Ready to build?