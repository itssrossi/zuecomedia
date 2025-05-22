
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveAdAccount } from "@/services/facebookService";
import { toast } from "@/components/ui/sonner";

interface FacebookAccountSetupProps {
  onSuccess: () => void;
}

const FacebookAccountSetup = ({ onSuccess }: FacebookAccountSetupProps) => {
  const [accountId, setAccountId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await saveAdAccount(accountId, accountName, accessToken);
      toast.success("Facebook Ad account successfully connected");
      setAccountId("");
      setAccountName("");
      setAccessToken("");
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to connect account: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-zue-dark-light border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Connect Facebook Ad Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Ad Account ID</label>
            <Input
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="act_123456789"
              className="bg-zue-dark border-gray-700 text-white"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Account Name</label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="My Business"
              className="bg-zue-dark border-gray-700 text-white"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Access Token</label>
            <Input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Facebook API Access Token"
              className="bg-zue-dark border-gray-700 text-white"
              required
            />
            <p className="text-xs text-gray-400">
              You'll need a Facebook API access token with ads_read permission.
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="bg-zue-blue hover:bg-zue-blue-dark text-white w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Connecting..." : "Connect Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FacebookAccountSetup;
