import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNurturingCredentials } from "@/hooks/useNurturingCredentials";
import MessageBuilder from "./MessageBuilder";
import ContactImporter from "./ContactImporter";
import { CampaignConfig, MessageConfig, createCampaign } from "@/services/nurturingCampaignService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CampaignFormProps {
  onClose: () => void;
}

const CampaignForm = ({ onClose }: CampaignFormProps) => {
  const navigate = useNavigate();
  const { hasResend, hasTwilio } = useNurturingCredentials();
  const [step, setStep] = useState(1);
  const [campaignConfig, setCampaignConfig] = useState<CampaignConfig>({
    name: "",
    type: "short_term",
    description: "",
    email_enabled: hasResend,
    sms_enabled: hasTwilio,
    status: "draft",
  });
  const [messages, setMessages] = useState<MessageConfig[]>([
    {
      message_type: "email",
      sequence_order: 1,
      content: "",
      timing_type: "immediate",
    },
  ]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleTypeChange = (type: 'short_term' | 'long_term' | 'custom') => {
    setCampaignConfig({ ...campaignConfig, type });
    
    // Set default messages based on type
    if (type === 'short_term') {
      setMessages([
        { message_type: "email", sequence_order: 1, content: "", timing_type: "immediate" },
        { message_type: "email", sequence_order: 2, content: "", timing_type: "delay", delay_value: 2, delay_unit: "days" },
        { message_type: "sms", sequence_order: 3, content: "", timing_type: "delay", delay_value: 5, delay_unit: "days" },
        { message_type: "email", sequence_order: 4, content: "", timing_type: "delay", delay_value: 7, delay_unit: "days" },
        { message_type: "email", sequence_order: 5, content: "", timing_type: "delay", delay_value: 14, delay_unit: "days" },
      ]);
    } else if (type === 'long_term') {
      setMessages([
        { message_type: "email", sequence_order: 1, content: "", timing_type: "immediate" },
        { message_type: "email", sequence_order: 2, content: "", timing_type: "delay", delay_value: 3, delay_unit: "days" },
        { message_type: "sms", sequence_order: 3, content: "", timing_type: "delay", delay_value: 7, delay_unit: "days" },
        { message_type: "email", sequence_order: 4, content: "", timing_type: "delay", delay_value: 14, delay_unit: "days" },
        { message_type: "email", sequence_order: 5, content: "", timing_type: "delay", delay_value: 21, delay_unit: "days" },
        { message_type: "sms", sequence_order: 6, content: "", timing_type: "delay", delay_value: 30, delay_unit: "days" },
        { message_type: "email", sequence_order: 7, content: "", timing_type: "delay", delay_value: 45, delay_unit: "days" },
        { message_type: "email", sequence_order: 8, content: "", timing_type: "delay", delay_value: 60, delay_unit: "days" },
      ]);
    }
  };

  const handleMessageChange = (index: number, updated: MessageConfig) => {
    const newMessages = [...messages];
    newMessages[index] = { ...updated, sequence_order: index + 1 };
    setMessages(newMessages);
  };

  const handleAddMessage = () => {
    setMessages([
      ...messages,
      {
        message_type: campaignConfig.email_enabled ? "email" : "sms",
        sequence_order: messages.length + 1,
        content: "",
        timing_type: "delay",
        delay_value: 1,
        delay_unit: "days",
      },
    ]);
  };

  const handleDeleteMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index).map((msg, idx) => ({
      ...msg,
      sequence_order: idx + 1,
    })));
  };

  const handleImportContacts = async (importedContacts: any[]) => {
    setContacts(importedContacts);
    toast.success(`${importedContacts.length} contacts ready to import`);
  };

  const handleSubmit = async (activate: boolean) => {
    if (!campaignConfig.name) {
      toast.error("Campaign name is required");
      return;
    }

    if (messages.length === 0) {
      toast.error("At least one message is required");
      return;
    }

    if (contacts.length === 0) {
      toast.error("Please import contacts first");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create campaign with messages
      const config: CampaignConfig = { 
        ...campaignConfig, 
        status: activate ? 'active' as const : 'draft' as const 
      };
      const campaign = await createCampaign(config, messages);

      // Import contacts
      const { data: { user } } = await supabase.auth.getUser();
      const contactsWithCampaign = contacts.map(c => ({
        ...c,
        campaign_id: campaign.id,
        user_id: user!.id,
      }));

      const { error: contactsError } = await supabase
        .from("nurture_contacts")
        .insert(contactsWithCampaign);

      if (contactsError) throw contactsError;

      toast.success(`Campaign ${activate ? 'created and activated' : 'saved as draft'}!`);
      navigate('/lead-nurturing');
    } catch (error: any) {
      toast.error(error.message || "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Progress value={progress} className="w-full" />
      
      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Campaign Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={campaignConfig.name}
                onChange={(e) => setCampaignConfig({ ...campaignConfig, name: e.target.value })}
                placeholder="e.g., Welcome Series 2024"
              />
            </div>

            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <div className="grid grid-cols-3 gap-4">
                {(['short_term', 'long_term', 'custom'] as const).map((type) => (
                  <Card
                    key={type}
                    className={`cursor-pointer transition-colors ${
                      campaignConfig.type === type
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleTypeChange(type)}
                  >
                    <CardContent className="pt-6 text-center">
                      <p className="font-semibold capitalize">
                        {type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {type === 'short_term' && '5 messages / 2 weeks'}
                        {type === 'long_term' && '8 messages / 2 months'}
                        {type === 'custom' && 'Build your own'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={campaignConfig.description}
                onChange={(e) => setCampaignConfig({ ...campaignConfig, description: e.target.value })}
                placeholder="Describe your campaign..."
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Next: Configure Channels</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Channel Configuration */}
      {step === 2 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Channel Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-toggle">Email</Label>
                {!hasResend && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Configure Resend credentials in{" "}
                      <a href="/nurturing-settings" className="underline text-primary">
                        Settings
                      </a>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <Switch
                id="email-toggle"
                checked={campaignConfig.email_enabled}
                onCheckedChange={(checked) =>
                  setCampaignConfig({ ...campaignConfig, email_enabled: checked && hasResend })
                }
                disabled={!hasResend}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sms-toggle">SMS</Label>
                {!hasTwilio && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Configure Twilio credentials in{" "}
                      <a href="/nurturing-settings" className="underline text-primary">
                        Settings
                      </a>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <Switch
                id="sms-toggle"
                checked={campaignConfig.sms_enabled}
                onCheckedChange={(checked) =>
                  setCampaignConfig({ ...campaignConfig, sms_enabled: checked && hasTwilio })
                }
                disabled={!hasTwilio}
              />
            </div>

            {!campaignConfig.email_enabled && !campaignConfig.sms_enabled && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  At least one channel must be enabled
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!campaignConfig.email_enabled && !campaignConfig.sms_enabled}
              >
                Next: Build Messages
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Message Builder */}
      {step === 3 && (
        <div className="space-y-4">
          {messages.map((message, index) => (
            <MessageBuilder
              key={index}
              message={message}
              index={index}
              emailEnabled={campaignConfig.email_enabled}
              smsEnabled={campaignConfig.sms_enabled}
              onChange={handleMessageChange}
              onDelete={handleDeleteMessage}
            />
          ))}

          <Button onClick={handleAddMessage} variant="outline" className="w-full">
            + Add Message
          </Button>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => setStep(4)}>Next: Import Contacts</Button>
          </div>
        </div>
      )}

      {/* Step 4: Contact Import */}
      {step === 4 && (
        <div className="space-y-4">
          <ContactImporter onImport={handleImportContacts} />
          
          {contacts.length > 0 && (
            <Alert>
              <AlertDescription>
                {contacts.length} contacts ready to import
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button onClick={() => setStep(5)} disabled={contacts.length === 0}>
              Next: Review
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Review & Launch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Campaign Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Name:</dt>
                  <dd className="font-medium">{campaignConfig.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Type:</dt>
                  <dd className="font-medium capitalize">{campaignConfig.type.replace('_', ' ')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Messages:</dt>
                  <dd className="font-medium">{messages.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Contacts:</dt>
                  <dd className="font-medium">{contacts.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Channels:</dt>
                  <dd className="font-medium">
                    {[
                      campaignConfig.email_enabled && 'Email',
                      campaignConfig.sms_enabled && 'SMS'
                    ].filter(Boolean).join(', ')}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                >
                  Save as Draft
                </Button>
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Activate Campaign"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampaignForm;
