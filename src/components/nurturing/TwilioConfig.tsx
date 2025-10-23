import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { saveTwilioCredentials } from "@/services/nurturingCredentialsService";
import { CheckCircle2, Loader2 } from "lucide-react";

interface TwilioConfigProps {
  initialAccountSid?: string;
  initialAuthToken?: string;
  initialPhoneNumber?: string;
  onSave: () => void;
}

export const TwilioConfig = ({
  initialAccountSid,
  initialAuthToken,
  initialPhoneNumber,
  onSave,
}: TwilioConfigProps) => {
  const [accountSid, setAccountSid] = useState(initialAccountSid || "");
  const [authToken, setAuthToken] = useState(initialAuthToken || "");
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setAccountSid(initialAccountSid || "");
    setAuthToken(initialAuthToken || "");
    setPhoneNumber(initialPhoneNumber || "");
  }, [initialAccountSid, initialAuthToken, initialPhoneNumber]);

  const handleSave = async () => {
    if (!accountSid || !authToken || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Basic validation for Account SID
    if (!accountSid.startsWith("AC")) {
      toast({
        title: "Invalid Account SID",
        description: "Account SID should start with 'AC'",
        variant: "destructive",
      });
      return;
    }

    // Basic phone number validation (E.164 format)
    if (!phoneNumber.startsWith("+")) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number should be in E.164 format (e.g., +1234567890)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await saveTwilioCredentials(accountSid, authToken, phoneNumber);
      toast({
        title: "Saved Successfully",
        description: "Twilio credentials have been saved",
      });
      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isConfigured = initialAccountSid && initialAuthToken && initialPhoneNumber;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Twilio Configuration
              {isConfigured && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </CardTitle>
            <CardDescription>
              Configure your Twilio credentials for SMS sending.{" "}
              <a
                href="https://console.twilio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Find credentials in Console
              </a>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="twilio-account-sid">Account SID *</Label>
          <Input
            id="twilio-account-sid"
            type="text"
            value={accountSid}
            onChange={(e) => setAccountSid(e.target.value)}
            placeholder="AC..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twilio-auth-token">Auth Token *</Label>
          <Input
            id="twilio-auth-token"
            type="password"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            placeholder="Your auth token"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twilio-phone-number">Twilio Phone Number *</Label>
          <Input
            id="twilio-phone-number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
          />
          <p className="text-sm text-muted-foreground">
            Use E.164 format. Need a number?{" "}
            <a
              href="https://console.twilio.com/us1/develop/phone-numbers/manage/search"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Buy one here
            </a>
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Credentials"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
