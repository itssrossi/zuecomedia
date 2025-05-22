
import ChecklistItem, { ChecklistItemType } from './ChecklistItem';

interface ChecklistContainerProps {
  items: ChecklistItemType[];
  onToggleItem: (id: number) => void;
}

const ChecklistContainer = ({ items, onToggleItem }: ChecklistContainerProps) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ChecklistItem 
          key={item.id} 
          item={item} 
          onToggle={onToggleItem}
        />
      ))}
    </div>
  );
};

export default ChecklistContainer;
