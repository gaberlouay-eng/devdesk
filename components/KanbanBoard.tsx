"use client";

import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Item, ItemStatus } from "@/lib/types";
import { Bug, FileText, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import ActualTimeModal from "./ActualTimeModal";

interface KanbanBoardProps {
  items: Item[];
  onStatusChange: (itemId: string, newStatus: ItemStatus, actualHours?: number) => void;
}

interface KanbanColumnProps {
  status: ItemStatus;
  items: Item[];
  onStatusChange: (itemId: string, newStatus: ItemStatus) => void;
}

const statusConfig = {
  TODO: { label: "To Do", color: "bg-gray-100 dark:bg-gray-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 dark:bg-blue-900/30" },
  DONE: { label: "Done", color: "bg-green-100 dark:bg-green-900/30" },
};

const priorityConfig = {
  LOW: { label: "Low", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" },
  MEDIUM: { label: "Medium", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" },
  HIGH: { label: "High", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
};

function KanbanCard({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: {
      status: item.status,
      type: "item",
    },
  });
  const router = useRouter();
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasDragged = useRef(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Track drag state
  useEffect(() => {
    if (isDragging) {
      hasDragged.current = true;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    } else {
      // Reset after drag ends
      setTimeout(() => {
        hasDragged.current = false;
      }, 200);
    }
  }, [isDragging]);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if we just dragged
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Delay navigation slightly to check if drag will start
    clickTimeoutRef.current = setTimeout(() => {
      if (!hasDragged.current) {
        router.push(`/items/${item.id}`);
      }
    }, 150);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="mb-3"
    >
      <motion.div
        whileHover={!isDragging ? { y: -2, scale: 1.02 } : {}}
        onMouseDown={() => {
          // Clear any pending click when starting to interact
          if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
          }
        }}
        onClick={handleClick}
        className="group relative rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-lg transition-all cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded pointer-events-none">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            {item.type === "BUG" ? (
              <Bug className="w-4 h-4 text-red-500 flex-shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityConfig[item.priority].color}`}>
              {priorityConfig[item.priority].label}
            </span>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {item.type}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function KanbanColumn({ status, items, onStatusChange }: KanbanColumnProps) {
  const statusInfo = statusConfig[status];
  const columnItems = items.filter((item) => item.status === status);
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      status: status,
      type: "column",
    },
  });

  return (
    <div className="flex-1 min-w-[280px]">
      <div className={`${statusInfo.color} rounded-xl p-4 mb-4`}>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {statusInfo.label}
        </h2>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {columnItems.length} {columnItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div
        ref={setNodeRef}
        data-column-status={status}
        className={`space-y-2 min-h-[200px] rounded-xl p-2 transition-colors ${
          isOver ? "bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-300 dark:border-indigo-700 border-dashed" : ""
        }`}
      >
        <SortableContext items={columnItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {columnItems.map((item) => (
            <KanbanCard key={item.id} item={item} />
          ))}
          {columnItems.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              Drop items here
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default function KanbanBoard({ items, onStatusChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [pendingItem, setPendingItem] = useState<{ id: string; status: ItemStatus } | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      console.log("No over target");
      return;
    }

    const itemId = active.id as string;
    const overId = over.id as string;
    
    console.log("Drag end:", { itemId, overId, overData: over.data.current });
    
    // Check if over.id is a valid status, not an item ID
    const validStatuses: ItemStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
    
    let newStatus: ItemStatus | null = null;
    
    // If over.id is a valid status, use it directly (dropped on column)
    if (validStatuses.includes(overId as ItemStatus)) {
      newStatus = overId as ItemStatus;
      console.log("Dropped on column:", newStatus);
      } else {
        // If over.id is an item ID, we need to find which column it's in
        // Check the data attribute first - this should have the column status
        const overData = over.data.current;
        if (overData?.status && validStatuses.includes(overData.status as ItemStatus)) {
          newStatus = overData.status as ItemStatus;
          console.log("Got status from data:", newStatus);
        } else {
          // Find the item and get its current status (which column it's currently in)
          // When dropping on an item, we want the column that item is in (target column)
          const overItem = items.find((i) => i.id === overId);
          if (overItem) {
            // Use the item's current status (the column it's currently in = target column)
            newStatus = overItem.status;
            console.log("Got status from item (target column):", newStatus);
          } else {
            // Try to find the column by checking the DOM
            // Find the closest column element
            try {
              const overElement = document.querySelector(`[data-sortable-id="${overId}"]`);
              const columnElement = overElement?.closest('[data-column-status]');
              const columnStatus = columnElement?.getAttribute('data-column-status');
              if (columnStatus && validStatuses.includes(columnStatus as ItemStatus)) {
                newStatus = columnStatus as ItemStatus;
                console.log("Got status from DOM:", newStatus);
              } else {
                console.warn("Could not determine target column for drop", { overId, overData, overElement, columnElement });
                return;
              }
            } catch (e) {
              console.warn("Error finding column in DOM:", e);
              return;
            }
          }
        }
      }

    if (!newStatus) {
      console.warn("Could not determine target status for drop");
      return;
    }

    const item = items.find((i) => i.id === itemId);
    
    if (item && item.status !== newStatus) {
      console.log("Status change:", { from: item.status, to: newStatus });
      // Check if moving to DONE from TODO or IN_PROGRESS
      if (newStatus === "DONE" && (item.status === "TODO" || item.status === "IN_PROGRESS")) {
        console.log("Showing time modal");
        setPendingItem({ id: itemId, status: newStatus });
        setShowTimeModal(true);
      } else {
        onStatusChange(itemId, newStatus);
      }
    } else {
      console.log("No status change or item not found", { item, currentStatus: item?.status, newStatus });
    }
  };

  const handleTimeConfirm = (hours: number) => {
    if (pendingItem) {
      onStatusChange(pendingItem.id, pendingItem.status, hours);
      setPendingItem(null);
    }
  };

  const handleTimeSkip = () => {
    if (pendingItem) {
      onStatusChange(pendingItem.id, pendingItem.status);
      setPendingItem(null);
    }
    setShowTimeModal(false);
  };

  const pendingItemData = pendingItem ? items.find((i) => i.id === pendingItem.id) : null;
  const activeItem = activeId ? items.find((item) => item.id === activeId) : null;

  // Custom collision detection that prioritizes columns
  const collisionDetection = (args: any) => {
    // First check for pointer collisions with columns
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions && pointerCollisions.length > 0) {
      // Find column collisions first
      const validStatuses: ItemStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
      const columnCollision = pointerCollisions.find((collision: any) => {
        return validStatuses.includes(collision.id as ItemStatus);
      });
      if (columnCollision) {
        return [columnCollision];
      }
    }
    // Fallback to default
    return closestCorners(args);
  };

  return (
    <>
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        <KanbanColumn
          status="TODO"
          items={items}
          onStatusChange={onStatusChange}
        />
        <KanbanColumn
          status="IN_PROGRESS"
          items={items}
          onStatusChange={onStatusChange}
        />
        <KanbanColumn
          status="DONE"
          items={items}
          onStatusChange={onStatusChange}
        />
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-xl opacity-90 rotate-2">
            <div className="flex items-center gap-2 mb-2">
              {activeItem.type === "BUG" ? (
                <Bug className="w-4 h-4 text-red-500" />
              ) : (
                <FileText className="w-4 h-4 text-blue-500" />
              )}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityConfig[activeItem.priority].color}`}>
                {priorityConfig[activeItem.priority].label}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {activeItem.title}
            </h3>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>

    {showTimeModal && pendingItemData && (
      <ActualTimeModal
        isOpen={showTimeModal}
        itemTitle={pendingItemData.title}
        estimatedHours={pendingItemData.estimatedHours}
        onClose={handleTimeSkip}
        onConfirm={handleTimeConfirm}
      />
    )}
    {/* Debug info */}
    {process.env.NODE_ENV === "development" && showTimeModal && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded z-50">
        Modal should be visible: {showTimeModal ? "YES" : "NO"}, Pending: {pendingItem ? "YES" : "NO"}
      </div>
    )}
    </>
  );
}

