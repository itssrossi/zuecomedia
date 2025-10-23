import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical } from "lucide-react";
import { MessageConfig } from "@/services/nurturingCampaignService";

interface MessageBuilderProps {
  message: MessageConfig;
  index: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  onChange: (index: number, updated: MessageConfig) => void;
  onDelete: (index: number) => void;
}

const MessageBuilder = ({
  message,
  index,
  emailEnabled,
  smsEnabled,
  onChange,
  onDelete,
}: MessageBuilderProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById(`content-${index}`) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = message.content;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newContent = before + variable + after;
      onChange(index, { ...message, content: newContent });
      
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
      }, 0);
    }
  };

  const variables = [
    { label: "First Name", value: "{{first_name}}" },
    { label: "Last Name", value: "{{last_name}}" },
    { label: "Email", value: "{{email}}" },
    { label: "Phone", value: "{{phone}}" },
    { label: "Company", value: "{{company}}" },
    { label: "Unsubscribe Link", value: "{{unsubscribe_link}}" },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
            <CardTitle className="text-base">
              Message {index + 1}
            </CardTitle>
            <Badge variant="outline">
              {message.message_type === 'email' ? 'Email' : 'SMS'}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(index)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message Type */}
        <div className="space-y-2">
          <Label>Message Type</Label>
          <Select
            value={message.message_type}
            onValueChange={(value: 'email' | 'sms') =>
              onChange(index, { ...message, message_type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {emailEnabled && <SelectItem value="email">Email</SelectItem>}
              {smsEnabled && <SelectItem value="sms">SMS</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {/* Email Subject */}
        {message.message_type === 'email' && (
          <div className="space-y-2">
            <Label htmlFor={`subject-${index}`}>Subject Line</Label>
            <Input
              id={`subject-${index}`}
              value={message.subject || ''}
              onChange={(e) =>
                onChange(index, { ...message, subject: e.target.value })
              }
              placeholder="Enter email subject..."
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor={`content-${index}`}>
            Message Content
            {message.message_type === 'sms' && (
              <span className="text-muted-foreground ml-2">
                ({message.content.length}/160 characters)
              </span>
            )}
          </Label>
          <Textarea
            id={`content-${index}`}
            value={message.content}
            onChange={(e) =>
              onChange(index, { ...message, content: e.target.value })
            }
            placeholder="Enter your message..."
            rows={6}
            maxLength={message.message_type === 'sms' ? 160 : undefined}
          />
          <div className="flex flex-wrap gap-2">
            {variables.map((v) => (
              <Button
                key={v.value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertVariable(v.value)}
              >
                {v.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Timing Configuration */}
        <div className="space-y-2">
          <Label>Timing</Label>
          <Select
            value={message.timing_type}
            onValueChange={(value: 'immediate' | 'delay' | 'schedule') =>
              onChange(index, { ...message, timing_type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {index === 0 && <SelectItem value="immediate">Send Immediately</SelectItem>}
              <SelectItem value="delay">Delay After Previous</SelectItem>
              <SelectItem value="schedule">Specific Day & Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Delay Configuration */}
        {message.timing_type === 'delay' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`delay-value-${index}`}>Delay Value</Label>
              <Input
                id={`delay-value-${index}`}
                type="number"
                min="1"
                value={message.delay_value || 1}
                onChange={(e) =>
                  onChange(index, { ...message, delay_value: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`delay-unit-${index}`}>Unit</Label>
              <Select
                value={message.delay_unit || 'days'}
                onValueChange={(value: 'minutes' | 'hours' | 'days' | 'weeks') =>
                  onChange(index, { ...message, delay_unit: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Schedule Configuration */}
        {message.timing_type === 'schedule' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`schedule-day-${index}`}>Day</Label>
              <Select
                value={message.schedule_day || 'monday'}
                onValueChange={(value) =>
                  onChange(index, { ...message, schedule_day: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="any">Any Day</SelectItem>
                  <SelectItem value="weekday">Weekday Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`schedule-time-${index}`}>Time</Label>
              <Input
                id={`schedule-time-${index}`}
                type="time"
                value={message.schedule_time || '09:00'}
                onChange={(e) =>
                  onChange(index, { ...message, schedule_time: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {/* Preview */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Hide' : 'Show'} Preview
        </Button>

        {showPreview && (
          <Card className="bg-muted">
            <CardContent className="pt-4">
              {message.message_type === 'email' && message.subject && (
                <p className="font-semibold mb-2">Subject: {message.subject}</p>
              )}
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageBuilder;
