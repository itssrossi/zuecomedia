import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNurturingCredentials } from "@/hooks/useNurturingCredentials";
import { fetchCampaigns, pauseCampaign, resumeCampaign, deleteCampaign } from "@/services/nurturingCampaignService";
import CampaignList from "@/components/nurturing/CampaignList";
import CampaignForm from "@/components/nurturing/CampaignForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const LeadNurturing = () => {
  const navigate = useNavigate();
  const { hasResend, hasTwilio, hasGoogleSheets, isLoading: credentialsLoading } = useNurturingCredentials();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("campaigns");

  const hasAnyCredentials = hasResend || hasTwilio || hasGoogleSheets;

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCampaigns();
      setCampaigns(data || []);
    } catch (error: any) {
      console.error("Error loading campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/lead-nurturing/campaign/${id}`);
  };

  const handlePause = async (id: string) => {
    try {
      await pauseCampaign(id);
      toast.success("Campaign paused");
      loadCampaigns();
    } catch (error: any) {
      toast.error(error.message || "Failed to pause campaign");
    }
  };

  const handleResume = async (id: string) => {
    try {
      await resumeCampaign(id);
      toast.success("Campaign resumed");
      loadCampaigns();
    } catch (error: any) {
      toast.error(error.message || "Failed to resume campaign");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCampaign(id);
      toast.success("Campaign deleted");
      loadCampaigns();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete campaign");
    }
  };

  const handleViewAnalytics = (id: string) => {
    navigate(`/lead-nurturing/campaign/${id}`);
  };

  const handleSyncNow = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;

    toast.info("Syncing contacts from Google Sheet...");
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-google-sheet-contacts', {
        body: { campaign_id: id }
      });

      if (error) throw error;

      const result = data?.results?.[0];
      if (result?.status === 'success') {
        const newContacts = result.new_contacts || 0;
        toast.success(
          newContacts > 0 
            ? `✓ Synced ${newContacts} new contact${newContacts === 1 ? '' : 's'}` 
            : "No new contacts found"
        );
        loadCampaigns();
      } else if (result?.error) {
        toast.error(`Sync failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error("Sync error:", error);
      toast.error(error.message || "Failed to sync contacts");
    }
  };

  if (credentialsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Lead Nurturing</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your email and SMS campaigns
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/nurturing-settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            {hasAnyCredentials && !showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            )}
          </div>
        </div>

        {/* Credential Warning */}
        {!hasAnyCredentials && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              To get started, please configure your API credentials in{" "}
              <a href="/nurturing-settings" className="underline text-primary font-semibold">
                Nurturing Settings
              </a>
              . You'll need at least one of: Resend (Email), Twilio (SMS), or Google Sheets (Contact Import).
            </AlertDescription>
          </Alert>
        )}

        {/* Create Form */}
        {showCreateForm ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Create New Campaign</h2>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
            <CampaignForm onClose={() => {
              setShowCreateForm(false);
              loadCampaigns();
            }} />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="mt-6">
              <CampaignList
                campaigns={campaigns}
                isLoading={isLoading}
                onEdit={handleEdit}
                onPause={handlePause}
                onResume={handleResume}
                onDelete={handleDelete}
                onViewAnalytics={handleViewAnalytics}
                onSyncNow={handleSyncNow}
              />
            </TabsContent>

            <TabsContent value="contacts" className="mt-6">
              <Alert>
                <AlertDescription>
                  Contact management coming soon. For now, contacts are managed within each campaign.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Alert>
                <AlertDescription>
                  Analytics dashboard coming soon. View individual campaign analytics by clicking on a campaign.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default LeadNurturing;
