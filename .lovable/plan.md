## Plan: Fix Missing Signup Confirmation Emails

### Diagnosis

Auth logs confirm signups succeed (`confirmation_sent_at` is set) and Supabase attempts to send the confirmation email. Emails are not arriving. This is a Supabase Auth email delivery issue, not an app code issue. The most common causes for this project:

1. **Default Supabase SMTP is rate-limited** — the built-in email service only allows ~2 emails/hour and is intended for testing. Repeated signups (as shown in the logs) will silently drop.
2. **No custom SMTP configured** — for reliable delivery, a real email provider (Resend, etc.) must be set as the Auth SMTP provider.
3. **`emailRedirectTo` is not set on `signUp`** — the current code in `AuthContext.tsx` calls `supabase.auth.signUp` without `emailRedirectTo`, so confirmation links may point to Supabase's default URL instead of the app.
4. **Email confirmations may be disabled** in Supabase Auth settings, in which case no email is ever sent (but users still get a session).

### Proposed Fix

**Step 1 — Code fix (small):**
- Update `src/context/AuthContext.tsx` `signUp` to pass `emailRedirectTo: ${window.location.origin}/` so the confirmation link returns to the app.

**Step 2 — Configuration (user action required, guided):**
Recommend configuring custom SMTP via **Resend** (already in the project — `RESEND_API_KEY` secret exists and Resend is used in `send-nurture-email`). Two options:

- **Option A (recommended): Configure Resend as Supabase Auth SMTP**
  User adds Resend SMTP credentials in Supabase Dashboard → Authentication → Emails → SMTP Settings:
  - Host: `smtp.resend.com`
  - Port: `465`
  - Username: `resend`
  - Password: the Resend API key
  - Sender email: an address on a verified Resend domain
  This immediately fixes delivery for signup, password reset, and magic link emails using Supabase's built-in templates.

- **Option B: Scaffold Lovable-managed auth email templates**
  Uses `scaffold_auth_email_templates` to create branded React Email templates + `auth-email-hook` edge function. Requires an email domain to be configured for the project first (currently none). More setup, but gives full branding control.

**Step 3 — Verify:**
- After SMTP is configured, sign up with a fresh email and confirm the message arrives.
- Check Supabase Auth logs and (for Option A) Resend dashboard for send status.

### Question

Which route do you want:
- **A**: I'll update the `signUp` code and walk you through pasting Resend SMTP into the Supabase dashboard (fastest, ~2 minutes).
- **B**: Full Lovable-managed branded auth emails (requires setting up an email domain first).