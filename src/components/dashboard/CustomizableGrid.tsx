import { useMemo, useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Plus, Settings2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { ALL_TILES, TileId } from "@/hooks/useDashboardLayout";
import { TILE_META, renderTile } from "./tileRegistry";
import type { AdMetric, DashboardStats } from "@/hooks/useFacebookData";
import type { FbAd } from "@/services/facebookService";

interface Props {
  tiles: TileId[];
  onChange: (next: TileId[]) => void;
  metrics: AdMetric[];
  stats: DashboardStats;
  isLoading: boolean;
  ads: FbAd[];
  trends: {
    spendTrendData: { name: string; value: number }[];
    revenueTrendData: { name: string; value: number }[];
    roasTrendData: { name: string; value: number }[];
    ctrTrendData: { name: string; value: number }[];
  };
}

const SortableTile = ({ id, editing, onRemove, children, size }: { id: string; editing: boolean; onRemove: () => void; children: React.ReactNode; size: "sm" | "lg" }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const colSpan = size === "lg" ? "md:col-span-2 lg:col-span-2" : "";
  return (
    <div ref={setNodeRef} style={style} className={`relative ${colSpan}`}>
      {editing && (
        <div className="absolute -top-2 -right-2 z-20 flex gap-1">
          <button
            onClick={onRemove}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
            aria-label="Remove tile"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {editing && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing bg-zue-blue/80 text-white rounded p-1 shadow-lg"
          aria-label="Drag tile"
        >
          <GripVertical size={14} />
        </div>
      )}
      {editing && <div className="absolute inset-0 z-10 rounded-lg ring-2 ring-zue-blue/60 pointer-events-none" />}
      {children}
    </div>
  );
};

const CustomizableGrid = ({ tiles, onChange, metrics, stats, isLoading, trends, ads }: Props) => {
  const [editing, setEditing] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const ctx = { metrics, stats, isLoading, trends, ads };

  const availableToAdd = useMemo(() => ALL_TILES.filter((t) => !tiles.includes(t)), [tiles]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = tiles.indexOf(active.id as TileId);
    const newIndex = tiles.indexOf(over.id as TileId);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(tiles, oldIndex, newIndex));
  };

  const removeTile = (id: TileId) => onChange(tiles.filter((t) => t !== id));
  const addTile = (id: TileId) => onChange([...tiles, id]);

  return (
    <div>
      <div className="flex justify-end items-center gap-2 mb-4">
        {editing && availableToAdd.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-zue-blue text-white hover:bg-zue-blue/20">
                <Plus size={14} className="mr-1" /> Add tile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zue-dark-light border-gray-700">
              <DropdownMenuLabel className="text-gray-300">Available tiles</DropdownMenuLabel>
              {availableToAdd.map((id) => (
                <DropdownMenuItem key={id} onClick={() => addTile(id)} className="text-white hover:bg-zue-blue/20 cursor-pointer">
                  {TILE_META[id].icon}
                  <span className="ml-2">{TILE_META[id].title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button
          variant={editing ? "default" : "outline"}
          size="sm"
          onClick={() => setEditing((e) => !e)}
          className={editing ? "bg-zue-blue hover:bg-blue-700" : "border-zue-blue text-white hover:bg-zue-blue/20"}
        >
          {editing ? <Check size={14} className="mr-1" /> : <Settings2 size={14} className="mr-1" />}
          {editing ? "Done" : "Customize"}
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tiles} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiles.map((id) => (
              <SortableTile key={id} id={id} editing={editing} onRemove={() => removeTile(id)} size={TILE_META[id].size}>
                {renderTile(id, ctx)}
              </SortableTile>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default CustomizableGrid;