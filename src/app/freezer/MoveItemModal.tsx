"use client";

import { useState } from "react";
import type { Freezer, FreezerItem } from "./types";

export default function MoveItemModal({
  item,
  freezers,
  onClose,
  onMoved,
}: {
  item: FreezerItem;
  freezers: Freezer[];
  onClose: () => void;
  onMoved: () => void;
}) {
  const [selectedDrawer, setSelectedDrawer] = useState<number | null>(null);
  const [moving, setMoving] = useState(false);

  const handleMove = async () => {
    if (!selectedDrawer) return;
    setMoving(true);

    await fetch(`/api/freezer-items/${item.id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drawerId: selectedDrawer }),
    });

    onMoved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full sm:max-w-sm bg-white dark:bg-[#0f1419] rounded-t-xl sm:rounded-xl border border-gray-200 dark:border-[#30363d] p-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-[#e6edf3]">
            Déplacer "{item.title}"
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-[#e6edf3]">
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {freezers.map((freezer) => (
            <div key={freezer.id}>
              <h3 className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase mb-1">
                🧊 {freezer.name}
              </h3>
              <div className="space-y-1 ml-4">
                {freezer.drawers.map((drawer) => {
                  const isCurrent = drawer.id === item.drawerId;
                  const isSelected = drawer.id === selectedDrawer;

                  return (
                    <button
                      key={drawer.id}
                      onClick={() => !isCurrent && setSelectedDrawer(drawer.id)}
                      disabled={isCurrent}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        isCurrent
                          ? "bg-gray-100 dark:bg-[#1c2128] text-gray-400 dark:text-[#484f59] cursor-not-allowed"
                          : isSelected
                          ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-500 text-indigo-700 dark:text-indigo-300"
                          : "hover:bg-gray-50 dark:hover:bg-[#1c2128] text-gray-700 dark:text-[#e6edf3]"
                      }`}
                    >
                      {drawer.name}
                      {isCurrent && <span className="text-xs ml-2">(actuel)</span>}
                      {isSelected && <span className="text-xs ml-2">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleMove}
          disabled={!selectedDrawer || moving}
          className="w-full mt-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {moving ? "Déplacement..." : "Déplacer ici"}
        </button>
      </div>
    </div>
  );
}
