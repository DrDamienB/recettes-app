"use client";

import { useState } from "react";
import { ITEM_TYPES } from "./types";

const QUICK_DATES = [
  { label: "+1 mois", months: 1 },
  { label: "+2 mois", months: 2 },
  { label: "+3 mois", months: 3 },
  { label: "+6 mois", months: 6 },
  { label: "+12 mois", months: 12 },
];

function addMonths(date: Date, months: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

export default function AddItemModal({
  drawerId,
  onClose,
  onAdded,
}: {
  drawerId: number;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("plat");
  const [quantity, setQuantity] = useState(1);
  const [expirationDate, setExpirationDate] = useState(addMonths(new Date(), 3));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    await fetch("/api/freezer-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type, quantity, expirationDate, drawerId }),
    });

    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full sm:max-w-md bg-white dark:bg-[#0f1419] rounded-t-xl sm:rounded-xl border border-gray-200 dark:border-[#30363d] p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-[#e6edf3]">
            Ajouter un item
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-[#e6edf3]">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Titre */}
          <input
            type="text"
            placeholder="Nom du produit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] text-gray-900 dark:text-[#e6edf3] placeholder-gray-400 dark:placeholder-[#484f59] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />

          {/* Type */}
          <div className="flex flex-wrap gap-1.5">
            {ITEM_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                  type === t.value
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                    : "border-gray-200 dark:border-[#30363d] text-gray-600 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#1c2128]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Quantité */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-[#8b949e]">Quantité :</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[#1c2128] text-gray-700 dark:text-[#e6edf3] hover:bg-gray-200 dark:hover:bg-[#30363d]"
              >
                -
              </button>
              <span className="text-sm font-medium text-gray-900 dark:text-[#e6edf3] min-w-[24px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[#1c2128] text-gray-700 dark:text-[#e6edf3] hover:bg-gray-200 dark:hover:bg-[#30363d]"
              >
                +
              </button>
            </div>
          </div>

          {/* Date de péremption - raccourcis */}
          <div>
            <span className="text-sm text-gray-600 dark:text-[#8b949e] block mb-1.5">Péremption :</span>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUICK_DATES.map((qd) => {
                const dateVal = addMonths(new Date(), qd.months);
                return (
                  <button
                    key={qd.months}
                    type="button"
                    onClick={() => setExpirationDate(dateVal)}
                    className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                      expirationDate === dateVal
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                        : "border-gray-200 dark:border-[#30363d] text-gray-600 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#1c2128]"
                    }`}
                  >
                    {qd.label}
                  </button>
                );
              })}
            </div>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] text-gray-900 dark:text-[#e6edf3]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Ajout..." : "Ajouter"}
          </button>
        </form>
      </div>
    </div>
  );
}
