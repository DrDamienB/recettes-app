"use client";

import { useState, useRef, useEffect } from "react";
import type { FreezerItem } from "./types";
import { getTypeInfo, getExpirationStatus } from "./types";

export default function ItemCard({
  item,
  onDelete,
  onQuantityChange,
  onMove,
  compact,
}: {
  item: FreezerItem;
  onDelete: () => void;
  onQuantityChange: (delta: number) => void;
  onMove: () => void;
  compact?: boolean;
}) {
  const [showActions, setShowActions] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const typeInfo = getTypeInfo(item.type);
  const expStatus = getExpirationStatus(item.expirationDate);
  const expDate = new Date(item.expirationDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  const toggleActions = () => {
    if (!showActions && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        left: Math.min(rect.right - 144, window.innerWidth - 152), // 144 = w-36
      });
    }
    setShowActions(!showActions);
  };

  return (
    <div
      className={`bg-white dark:bg-[#0f1419] border border-gray-200 dark:border-[#30363d] rounded-lg ${
        expStatus.urgent ? "border-l-2 border-l-red-500" : ""
      } ${compact ? "p-2" : "p-2.5"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-sm font-medium text-gray-900 dark:text-[#e6edf3] ${compact ? "text-xs" : ""}`}>
              {item.title}
            </span>
            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {/* Quantité */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onQuantityChange(-1); }}
                className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 dark:bg-[#1c2128] text-gray-600 dark:text-[#8b949e] text-xs hover:bg-gray-200 dark:hover:bg-[#30363d]"
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="text-xs text-gray-700 dark:text-[#e6edf3] min-w-[16px] text-center">
                {item.quantity}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onQuantityChange(1); }}
                className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 dark:bg-[#1c2128] text-gray-600 dark:text-[#8b949e] text-xs hover:bg-gray-200 dark:hover:bg-[#30363d]"
              >
                +
              </button>
            </div>

            <span className="text-gray-300 dark:text-[#30363d]">|</span>

            {/* Date expiration */}
            <span className={`text-xs ${expStatus.class}`}>
              {expStatus.urgent && "⚠️ "}
              {expDate}
            </span>
          </div>
        </div>

        {/* Actions */}
        <button
          ref={btnRef}
          onClick={toggleActions}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#1c2128] text-gray-400 dark:text-[#484f59] transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {showActions && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowActions(false)} />
            <div
              className="fixed z-50 w-36 bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-lg shadow-lg overflow-hidden"
              style={{ top: menuPos.top, left: menuPos.left }}
            >
              <button
                onClick={() => { setShowActions(false); onMove(); }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-[#e6edf3] hover:bg-gray-100 dark:hover:bg-[#30363d] flex items-center gap-2"
              >
                <span>📦</span> Déplacer
              </button>
              <button
                onClick={() => { setShowActions(false); onDelete(); }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <span>🗑️</span> Supprimer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
