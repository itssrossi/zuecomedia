import { supabase } from "@/integrations/supabase/client";

export interface NurturingCredentials {
  resend_api_key?: string;
  resend_email_from?: string;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_phone_number?: string;
  google_sheets_api_key?: string;
}

export const fetchUserCredentials = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("nurture_credentials")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const saveResendCredentials = async (
  apiKey: string,
  fromEmail: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await (supabase as any)
    .from("nurture_credentials")
    .upsert({
      user_id: user.id,
      resend_api_key: apiKey,
      resend_email_from: fromEmail,
    }, {
      onConflict: "user_id"
    });

  if (error) throw error;
};

export const saveTwilioCredentials = async (
  accountSid: string,
  authToken: string,
  phoneNumber: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await (supabase as any)
    .from("nurture_credentials")
    .upsert({
      user_id: user.id,
      twilio_account_sid: accountSid,
      twilio_auth_token: authToken,
      twilio_phone_number: phoneNumber,
    }, {
      onConflict: "user_id"
    });

  if (error) throw error;
};

export const saveGoogleSheetsCredentials = async (apiKey: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await (supabase as any)
    .from("nurture_credentials")
    .upsert({
      user_id: user.id,
      google_sheets_api_key: apiKey,
    }, {
      onConflict: "user_id"
    });

  if (error) throw error;
};
