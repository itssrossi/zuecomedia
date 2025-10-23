import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { extractSheetId, fetchSheetData, detectColumns } from "@/services/googleSheetsService";
import { useNurturingCredentials } from "@/hooks/useNurturingCredentials";
import { toast } from "sonner";

interface ContactImporterProps {
  onImport: (contacts: any[], sheetUrl?: string, columnMappings?: any) => void;
}

const ContactImporter = ({ onImport }: ContactImporterProps) => {
  const { credentials, hasGoogleSheets } = useNurturingCredentials();
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState({
    email: -1,
    phone: -1,
    firstName: -1,
    lastName: -1,
    company: -1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);

  const handleFetchColumns = async () => {
    if (!hasGoogleSheets) {
      toast.error("Please configure Google Sheets API key in settings");
      return;
    }

    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      toast.error("Invalid Google Sheets URL");
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchSheetData(sheetId, credentials!.google_sheets_api_key!);
      setSheetData(data);
      
      if (data.length > 0) {
        const detected = detectColumns(data[0]);
        setColumnMapping(detected);
        setIsFetched(true);
        toast.success(`Fetched ${data.length - 1} rows from sheet`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch sheet data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (columnMapping.email === -1) {
      toast.error("Email column is required");
      return;
    }

    const headers = sheetData[0];
    const rows = sheetData.slice(1);

    const contacts = rows.map(row => ({
      email: row[columnMapping.email] || '',
      phone: columnMapping.phone !== -1 ? row[columnMapping.phone] : '',
      first_name: columnMapping.firstName !== -1 ? row[columnMapping.firstName] : '',
      last_name: columnMapping.lastName !== -1 ? row[columnMapping.lastName] : '',
      custom_fields: {
        company: columnMapping.company !== -1 ? row[columnMapping.company] : '',
      },
    })).filter(contact => contact.email); // Only include rows with email

    onImport(contacts, sheetUrl, columnMapping);
    toast.success(`Importing ${contacts.length} contacts...`);
  };

  if (!hasGoogleSheets) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please configure your Google Sheets API key in{" "}
          <a href="/nurturing-settings" className="underline text-primary">
            Nurturing Settings
          </a>{" "}
          to import contacts.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Import Contacts from Google Sheets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sheet-url">Google Sheets URL</Label>
          <div className="flex gap-2">
            <Input
              id="sheet-url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
            <Button onClick={handleFetchColumns} disabled={isLoading || !sheetUrl}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                "Fetch Columns"
              )}
            </Button>
          </div>
        </div>

        {isFetched && sheetData.length > 0 && (
          <>
            <div className="space-y-4">
              <h3 className="font-semibold">Map Columns</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email (Required)</Label>
                  <Select
                    value={columnMapping.email.toString()}
                    onValueChange={(value) =>
                      setColumnMapping({ ...columnMapping, email: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sheetData[0].map((header, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Phone (Optional)</Label>
                  <Select
                    value={columnMapping.phone.toString()}
                    onValueChange={(value) =>
                      setColumnMapping({ ...columnMapping, phone: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">None</SelectItem>
                      {sheetData[0].map((header, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>First Name (Optional)</Label>
                  <Select
                    value={columnMapping.firstName.toString()}
                    onValueChange={(value) =>
                      setColumnMapping({ ...columnMapping, firstName: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">None</SelectItem>
                      {sheetData[0].map((header, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Last Name (Optional)</Label>
                  <Select
                    value={columnMapping.lastName.toString()}
                    onValueChange={(value) =>
                      setColumnMapping({ ...columnMapping, lastName: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">None</SelectItem>
                      {sheetData[0].map((header, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Preview (First 5 Contacts)</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sheetData.slice(1, 6).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{columnMapping.email !== -1 ? row[columnMapping.email] : '-'}</TableCell>
                        <TableCell>{columnMapping.phone !== -1 ? row[columnMapping.phone] : '-'}</TableCell>
                        <TableCell>{columnMapping.firstName !== -1 ? row[columnMapping.firstName] : '-'}</TableCell>
                        <TableCell>{columnMapping.lastName !== -1 ? row[columnMapping.lastName] : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Found {sheetData.length - 1} contacts in the sheet
              </AlertDescription>
            </Alert>

            <Button onClick={handleImport} className="w-full">
              Import Contacts
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactImporter;
