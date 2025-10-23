import { Mail, MessageSquare, Play, Pause, Trash2, BarChart3, RefreshCw, Sheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  created_at: string;
  auto_sync_enabled?: boolean;
  google_sheet_url?: string;
  nurture_messages?: { count: number }[];
  nurture_contacts?: { count: number; imported_at?: string }[];
}

interface CampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onViewAnalytics: (id: string) => void;
  onSyncNow: (id: string) => void;
}

const CampaignList = ({
  campaigns,
  isLoading,
  onEdit,
  onPause,
  onResume,
  onDelete,
  onViewAnalytics,
  onSyncNow,
}: CampaignListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create your first nurturing campaign to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'paused': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'draft': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'short_term': return 'Short-term';
      case 'long_term': return 'Long-term';
      case 'custom': return 'Custom';
      default: return type;
    }
  };

  const getLastSyncTime = (campaign: Campaign) => {
    const contacts = campaign.nurture_contacts;
    if (!contacts || contacts.length === 0) return null;
    
    // Get the most recent imported_at timestamp
    const lastSync = contacts.reduce((latest: Date | null, contact: any) => {
      if (contact.imported_at) {
        const date = new Date(contact.imported_at);
        return !latest || date > latest ? date : latest;
      }
      return latest;
    }, null);

    if (!lastSync) return null;

    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {campaigns.map((campaign) => {
        const messageCount = campaign.nurture_messages?.[0]?.count || 0;
        const contactCount = campaign.nurture_contacts?.[0]?.count || 0;
        const lastSyncTime = getLastSyncTime(campaign);

        return (
          <Card key={campaign.id} className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                <Badge variant="outline" className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="secondary">{getTypeLabel(campaign.type)}</Badge>
                {campaign.email_enabled && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Badge>
                )}
                {campaign.sms_enabled && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    SMS
                  </Badge>
                )}
                {campaign.google_sheet_url && campaign.auto_sync_enabled && (
                  <Badge variant="outline" className="flex items-center gap-1 bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <Sheet className="h-3 w-3" />
                    Auto-sync
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Messages</p>
                  <p className="font-semibold">{messageCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contacts</p>
                  <p className="font-semibold">{contactCount}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Created {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                </p>
                {campaign.google_sheet_url && lastSyncTime && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sheet className="h-3 w-3" />
                    Last synced {lastSyncTime}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(campaign.id)}
                >
                  Edit
                </Button>
                {campaign.google_sheet_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSyncNow(campaign.id)}
                    title="Sync contacts from Google Sheet now"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
                {campaign.status === 'active' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPause(campaign.id)}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : campaign.status === 'paused' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResume(campaign.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewAnalytics(campaign.id)}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure? This will permanently delete the campaign and all associated messages and contacts.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(campaign.id)} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CampaignList;
