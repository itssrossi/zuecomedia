import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { saveGoogleSheetsCredentials } from "@/services/nurturingCredentialsService";
import { CheckCircle2, Loader2 } from "lucide-react";

interface GoogleSheetsConfigProps {
  initialApiKey?: string;
  onSave: () => void;
}

export const GoogleSheetsConfig = ({ initialApiKey, onSave }: GoogleSheetsConfigProps) => {
  const [apiKey, setApiKey] = useState(initialApiKey || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setApiKey(initialApiKey || "");
  }, [initialApiKey]);

  const handleSave = async () => {
    if (!apiKey) {
      toast({
        title: "Missing Information",
        description: "Please enter your Google Sheets API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await saveGoogleSheetsCredentials(apiKey);
      toast({
        title: "Saved Successfully",
        description: "Google Sheets credentials have been saved",
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

  const isConfigured = !!initialApiKey;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Google Sheets Configuration
              {isConfigured && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </CardTitle>
            <CardDescription>
              Configure your Google Sheets API key for contact imports.{" "}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Create API key
              </a>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="google-sheets-api-key">API Key *</Label>
          <Input
            id="google-sheets-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza..."
          />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>To set up your API key:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to Google Cloud Console</li>
              <li>Enable Google Sheets API</li>
              <li>Create an API key in Credentials</li>
              <li>Restrict the key to Google Sheets API only</li>
            </ol>
          </div>
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
