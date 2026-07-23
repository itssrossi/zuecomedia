import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";

export const ReportEmailConfig = () => {
  const { reportEmail, updateReportEmail, isLoading } = useDashboardLayout();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setValue(reportEmail || ""); }, [reportEmail]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateReportEmail(value.trim());
      toast({ title: "Saved", description: "Weekly report email updated." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Weekly Report Email</CardTitle>
        <CardDescription>
          Recipient for the weekly performance report. Sent every Monday morning and when you click "Email Weekly Report" on the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="report-email">Email Address</Label>
          <Input
            id="report-email"
            type="email"
            placeholder="reports@yourbusiness.com"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button onClick={handleSave} disabled={saving || isLoading}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
};