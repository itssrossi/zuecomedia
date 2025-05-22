
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export interface ChecklistItemType {
  id: number;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  completed: boolean;
}

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (id: number) => void;
}

const ChecklistItem = ({ item, onToggle }: ChecklistItemProps) => {
  return (
    <Card className="bg-zue-dark-light border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3">
          <Checkbox 
            id={`task-${item.id}`}
            checked={item.completed}
            onCheckedChange={() => onToggle(item.id)}
            className="h-5 w-5"
          />
          <label 
            htmlFor={`task-${item.id}`}
            className={`text-xl cursor-pointer ${item.completed ? 'line-through text-gray-400' : ''}`}
          >
            {item.title}
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 mb-3">{item.description}</p>
        {item.link && (
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-zue-blue hover:text-zue-blue-light"
          >
            <ExternalLink size={16} />
            {item.linkText || "Open Link"}
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default ChecklistItem;
