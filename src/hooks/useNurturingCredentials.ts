import { useState, useEffect } from "react";
import { fetchUserCredentials, NurturingCredentials } from "@/services/nurturingCredentialsService";

export const useNurturingCredentials = () => {
  const [credentials, setCredentials] = useState<NurturingCredentials | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserCredentials();
      setCredentials(data);
    } catch (error) {
      console.error("Error loading credentials:", error);
      setCredentials(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasResend = !!(credentials?.resend_api_key && credentials?.resend_email_from);
  const hasTwilio = !!(credentials?.twilio_account_sid && credentials?.twilio_auth_token && credentials?.twilio_phone_number);
  const hasGoogleSheets = !!credentials?.google_sheets_api_key;

  return {
    credentials,
    hasResend,
    hasTwilio,
    hasGoogleSheets,
    isLoading,
    reload: loadCredentials,
  };
};
