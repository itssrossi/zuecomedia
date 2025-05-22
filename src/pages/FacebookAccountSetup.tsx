
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { saveAdAccount } from "@/services/facebookService";
import { useAuth } from "@/context/AuthContext";

const FacebookAccountSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    accountId: "",
    accountName: "",
    accessToken: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.accountName || !formData.accessToken) {
      toast.error("All fields are required");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await saveAdAccount(
        formData.accountId,
        formData.accountName,
        formData.accessToken
      );
      
      toast.success("Facebook Ad Account connected successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving Facebook Ad Account:", error);
      toast.error(error.message || "Failed to connect Facebook Ad Account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zue-dark text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex justify-center mb-8">
          <Facebook className="h-12 w-12 text-zue-blue" />
        </div>
        
        <Card className="bg-zue-dark-light border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Connect Facebook Ad Account</CardTitle>
            <CardDescription className="text-center text-gray-300">
              Complete your onboarding by connecting your Facebook Ad Account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="accountId" className="text-sm font-medium">
                  Facebook Ad Account ID
                </label>
                <Input
                  id="accountId"
                  name="accountId"
                  placeholder="e.g. act_1234567890"
                  value={formData.accountId}
                  onChange={handleChange}
                  className="bg-zue-dark border-gray-700"
                />
                <p className="text-xs text-gray-400">
                  You can find this in Facebook Business Manager under Ad Account Settings
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="accountName" className="text-sm font-medium">
                  Ad Account Name
                </label>
                <Input
                  id="accountName"
                  name="accountName"
                  placeholder="e.g. My Business Ad Account"
                  value={formData.accountName}
                  onChange={handleChange}
                  className="bg-zue-dark border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="accessToken" className="text-sm font-medium">
                  Facebook Access Token
                </label>
                <Textarea
                  id="accessToken"
                  name="accessToken"
                  placeholder="Paste your Facebook access token here"
                  value={formData.accessToken}
                  onChange={handleChange}
                  className="bg-zue-dark border-gray-700 min-h-[100px]"
                />
                <p className="text-xs text-gray-400">
                  <a
                    href="https://developers.facebook.com/tools/explorer/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zue-blue hover:underline"
                  >
                    Generate a token
                  </a>{" "}
                  with ads_management and ads_read permissions.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/dashboard")}
                disabled={isSubmitting}
              >
                Skip for now
              </Button>
              <Button 
                type="submit" 
                className="bg-zue-blue hover:bg-zue-blue-dark text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Connecting..." : "Connect Account"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default FacebookAccountSetup;
