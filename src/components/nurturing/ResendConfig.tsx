import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { saveResendCredentials } from "@/services/nurturingCredentialsService";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ResendConfigProps {
  initialApiKey?: string;
  initialFromEmail?: string;
  onSave: () => void;
}

export const ResendConfig = ({ initialApiKey, initialFromEmail, onSave }: ResendConfigProps) => {
  const [apiKey, setApiKey] = useState(initialApiKey || "");
  const [fromEmail, setFromEmail] = useState(initialFromEmail || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setApiKey(initialApiKey || "");
    setFromEmail(initialFromEmail || "");
  }, [initialApiKey, initialFromEmail]);

  const handleSave = async () => {
    if (!apiKey || !fromEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail.replace(/.*<(.+)>/, "$1"))) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await saveResendCredentials(apiKey, fromEmail);
      toast({
        title: "Saved Successfully",
        description: "Resend credentials have been saved",
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

  const isConfigured = initialApiKey && initialFromEmail;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Resend Configuration
              {isConfigured && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </CardTitle>
            <CardDescription>
              Configure your Resend API credentials for email sending.{" "}
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get your API key
              </a>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resend-api-key">API Key *</Label>
          <Input
            id="resend-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="re_..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resend-from-email">From Email *</Label>
          <Input
            id="resend-from-email"
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="noreply@yourdomain.com or Name <email@domain.com>"
          />
          <p className="text-sm text-muted-foreground">
            Make sure your domain is verified in Resend
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
