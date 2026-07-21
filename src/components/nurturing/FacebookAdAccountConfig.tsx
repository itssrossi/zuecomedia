import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, Trash2, Plus } from "lucide-react";
import {
  fetchUserAdAccounts,
  saveAdAccount,
  updateAdAccount,
  deleteAdAccount,
  type FbAdAccount,
} from "@/services/facebookService";

export const FacebookAdAccountConfig = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<FbAdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { account_id: string; account_name: string; access_token: string }>>({});

  // New account form
  const [newAccountId, setNewAccountId] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccessToken, setNewAccessToken] = useState("");
  const [addingNew, setAddingNew] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchUserAdAccounts();
      setAccounts(data);
      const map: Record<string, any> = {};
      data.forEach((a) => {
        map[a.id] = { account_id: a.account_id, account_name: a.account_name, access_token: "" };
      });
      setDrafts(map);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateDraft = (id: string, field: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleUpdate = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    try {
      const updates: any = {
        account_id: draft.account_id,
        account_name: draft.account_name,
      };
      if (draft.access_token && draft.access_token.trim().length > 0) {
        updates.access_token = draft.access_token.trim();
      }
      await updateAdAccount(id, updates);
      toast({ title: "Saved", description: "Ad account updated" });
      await load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this ad account? This won't delete synced metrics.")) return;
    try {
      await deleteAdAccount(id);
      toast({ title: "Removed", description: "Ad account removed" });
      await load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleAdd = async () => {
    if (!newAccountId || !newAccountName || !newAccessToken) {
      toast({ title: "Missing fields", description: "Fill all fields", variant: "destructive" });
      return;
    }
    setAddingNew(true);
    try {
      await saveAdAccount(newAccountId, newAccountName, newAccessToken);
      setNewAccountId("");
      setNewAccountName("");
      setNewAccessToken("");
      toast({ title: "Added", description: "Ad account connected" });
      await load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setAddingNew(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Facebook Ad Accounts
          {accounts.length > 0 && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        </CardTitle>
        <CardDescription>
          Manage the Facebook ad accounts and access tokens used to sync campaign data.{" "}
          <a
            href="https://developers.facebook.com/tools/explorer/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Generate a token
          </a>{" "}
          with ads_read permission.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          accounts.map((acc) => {
            const d = drafts[acc.id] || { account_id: "", account_name: "", access_token: "" };
            return (
              <div key={acc.id} className="space-y-3 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label>Ad Account ID</Label>
                  <Input
                    value={d.account_id}
                    onChange={(e) => updateDraft(acc.id, "account_id", e.target.value)}
                    placeholder="act_123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input
                    value={d.account_name}
                    onChange={(e) => updateDraft(acc.id, "account_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Access Token</Label>
                  <Textarea
                    value={d.access_token}
                    onChange={(e) => updateDraft(acc.id, "access_token", e.target.value)}
                    placeholder="Paste new token to replace the existing one (leave blank to keep current)"
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    For security the existing token is hidden. Enter a new one to replace it.
                  </p>
                </div>
                <div className="flex justify-between gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(acc.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </Button>
                  <Button
                    onClick={() => handleUpdate(acc.id)}
                    disabled={savingId === acc.id}
                  >
                    {savingId === acc.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        )}

        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Add another ad account
          </div>
          <div className="space-y-2">
            <Label>Ad Account ID</Label>
            <Input
              value={newAccountId}
              onChange={(e) => setNewAccountId(e.target.value)}
              placeholder="act_123456789"
            />
          </div>
          <div className="space-y-2">
            <Label>Account Name</Label>
            <Input
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              placeholder="My Business"
            />
          </div>
          <div className="space-y-2">
            <Label>Access Token</Label>
            <Textarea
              value={newAccessToken}
              onChange={(e) => setNewAccessToken(e.target.value)}
              placeholder="Facebook API access token"
              className="min-h-[80px]"
            />
          </div>
          <Button onClick={handleAdd} disabled={addingNew} className="w-full">
            {addingNew ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
              </>
            ) : (
              "Connect Account"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};