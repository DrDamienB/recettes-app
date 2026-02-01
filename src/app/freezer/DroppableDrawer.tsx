"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Drawer } from "./types";

export default function DroppableDrawer({
  drawer,
  children,
}: {
  drawer: Drawer;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: drawer.id });

  return (
    <div
      ref={setNodeRef}
      className={`p-2 rounded-lg border-2 border-dashed transition-colors ${
        isOver
          ? "border-indigo-400 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-900/20"
          : "border-transparent"
      }`}
    >
      {children}
    </div>
  );
}
