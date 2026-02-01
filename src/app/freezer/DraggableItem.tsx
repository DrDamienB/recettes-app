"use client";

import { useDraggable } from "@dnd-kit/core";
import type { FreezerItem } from "./types";

export default function DraggableItem({
  item,
  children,
}: {
  item: FreezerItem;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={isDragging ? "opacity-30 pointer-events-none" : ""}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}
