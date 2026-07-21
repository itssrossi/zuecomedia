import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ResendConfig } from "@/components/nurturing/ResendConfig";
import { TwilioConfig } from "@/components/nurturing/TwilioConfig";
import { GoogleSheetsConfig } from "@/components/nurturing/GoogleSheetsConfig";
import { FacebookAdAccountConfig } from "@/components/nurturing/FacebookAdAccountConfig";
import { fetchUserCredentials } from "@/services/nurturingCredentialsService";
import { useToast } from "@/hooks/use-toast";

const NurturingSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCredentials = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUserCredentials();
      setCredentials(data);
    } catch (error) {
      console.error("Error loading credentials:", error);
      toast({
        title: "Error",
        description: "Failed to load credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCredentials();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Lead Nurturing Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your API credentials for Facebook ads, email, SMS, and Google Sheets integration.
            All credentials are encrypted and stored securely.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading credentials...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <FacebookAdAccountConfig />

            <ResendConfig
              initialApiKey={credentials?.resend_api_key}
              initialFromEmail={credentials?.resend_email_from}
              onSave={loadCredentials}
            />

            <TwilioConfig
              initialAccountSid={credentials?.twilio_account_sid}
              initialAuthToken={credentials?.twilio_auth_token}
              initialPhoneNumber={credentials?.twilio_phone_number}
              onSave={loadCredentials}
            />

            <GoogleSheetsConfig
              initialApiKey={credentials?.google_sheets_api_key}
              onSave={loadCredentials}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NurturingSettings;
