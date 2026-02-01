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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-30" : ""}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}
