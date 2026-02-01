"use client";

import { useState } from "react";
import type { Freezer } from "./types";

export default function FreezerSettings({
  freezers,
  onBack,
}: {
  freezers: Freezer[];
  onBack: () => void;
}) {
  const [localFreezers, setLocalFreezers] = useState(freezers);
  const [newFreezerName, setNewFreezerName] = useState("");
  const [newDrawerName, setNewDrawerName] = useState<Record<number, string>>({});
  const [editingFreezer, setEditingFreezer] = useState<number | null>(null);
  const [editingDrawer, setEditingDrawer] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const addFreezer = async () => {
    if (!newFreezerName.trim()) return;
    const res = await fetch("/api/freezers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFreezerName.trim() }),
    });
    const freezer = await res.json();
    setLocalFreezers([...localFreezers, freezer]);
    setNewFreezerName("");
  };

  const deleteFreezer = async (id: number) => {
    if (!confirm("Supprimer ce congélateur et tout son contenu ?")) return;
    await fetch(`/api/freezers/${id}`, { method: "DELETE" });
    setLocalFreezers(localFreezers.filter((f) => f.id !== id));
  };

  const renameFreezer = async (id: number) => {
    if (!editName.trim()) return;
    await fetch(`/api/freezers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setLocalFreezers(localFreezers.map((f) => (f.id === id ? { ...f, name: editName.trim() } : f)));
    setEditingFreezer(null);
  };

  const addDrawer = async (freezerId: number) => {
    const name = newDrawerName[freezerId]?.trim();
    if (!name) return;
    const res = await fetch(`/api/freezers/${freezerId}/drawers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const drawer = await res.json();
    setLocalFreezers(
      localFreezers.map((f) =>
        f.id === freezerId ? { ...f, drawers: [...f.drawers, drawer] } : f
      )
    );
    setNewDrawerName({ ...newDrawerName, [freezerId]: "" });
  };

  const deleteDrawer = async (freezerId: number, drawerId: number) => {
    if (!confirm("Supprimer ce tiroir et son contenu ?")) return;
    await fetch(`/api/freezers/${freezerId}/drawers/${drawerId}`, { method: "DELETE" });
    setLocalFreezers(
      localFreezers.map((f) =>
        f.id === freezerId
          ? { ...f, drawers: f.drawers.filter((d) => d.id !== drawerId) }
          : f
      )
    );
  };

  const renameDrawer = async (freezerId: number, drawerId: number) => {
    if (!editName.trim()) return;
    await fetch(`/api/freezers/${freezerId}/drawers/${drawerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setLocalFreezers(
      localFreezers.map((f) =>
        f.id === freezerId
          ? { ...f, drawers: f.drawers.map((d) => (d.id === drawerId ? { ...d, name: editName.trim() } : d)) }
          : f
      )
    );
    setEditingDrawer(null);
  };

  return (
    <main className="pb-20">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-gray-100 dark:bg-[#1c2128] hover:bg-gray-200 dark:hover:bg-[#30363d] transition-colors"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3]">
          Gérer les congélateurs
        </h1>
      </div>

      {/* Ajouter un congélateur */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nouveau congélateur..."
          value={newFreezerName}
          onChange={(e) => setNewFreezerName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addFreezer()}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0f1419] text-gray-900 dark:text-[#e6edf3] placeholder-gray-400 dark:placeholder-[#484f59]"
        />
        <button
          onClick={addFreezer}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
        >
          Ajouter
        </button>
      </div>

      {/* Liste des congélateurs */}
      <div className="space-y-3">
        {localFreezers.map((freezer) => (
          <div
            key={freezer.id}
            className="bg-white dark:bg-[#0f1419] border border-gray-200 dark:border-[#30363d] rounded-lg overflow-hidden"
          >
            {/* Header congélateur */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1c2128]">
              {editingFreezer === freezer.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && renameFreezer(freezer.id)}
                    autoFocus
                    className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-[#30363d] bg-white dark:bg-[#0f1419] text-gray-900 dark:text-[#e6edf3]"
                  />
                  <button
                    onClick={() => renameFreezer(freezer.id)}
                    className="text-xs px-2 py-1 bg-indigo-600 text-white rounded"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setEditingFreezer(null)}
                    className="text-xs px-2 py-1 text-gray-500"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧊</span>
                    <span className="font-semibold text-gray-900 dark:text-[#e6edf3]">{freezer.name}</span>
                    <span className="text-xs text-gray-500 dark:text-[#8b949e]">
                      ({freezer.drawers.length} tiroir{freezer.drawers.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingFreezer(freezer.id); setEditName(freezer.name); }}
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#30363d] text-gray-500 dark:text-[#8b949e] text-xs"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteFreezer(freezer.id)}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Tiroirs */}
            <div className="p-3 space-y-2">
              {freezer.drawers.map((drawer) => (
                <div key={drawer.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-gray-50 dark:bg-[#1c2128]">
                  {editingDrawer === drawer.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && renameDrawer(freezer.id, drawer.id)}
                        autoFocus
                        className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-[#30363d] bg-white dark:bg-[#0f1419] text-gray-900 dark:text-[#e6edf3]"
                      />
                      <button
                        onClick={() => renameDrawer(freezer.id, drawer.id)}
                        className="text-xs px-2 py-1 bg-indigo-600 text-white rounded"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setEditingDrawer(null)}
                        className="text-xs text-gray-500"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-gray-700 dark:text-[#e6edf3]">
                        {drawer.name}
                        <span className="text-xs text-gray-400 dark:text-[#484f59] ml-2">
                          {drawer.items.length} item{drawer.items.length !== 1 ? "s" : ""}
                        </span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingDrawer(drawer.id); setEditName(drawer.name); }}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#30363d] text-gray-400 text-xs"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteDrawer(freezer.id, drawer.id)}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Ajouter un tiroir */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nouveau tiroir..."
                  value={newDrawerName[freezer.id] || ""}
                  onChange={(e) => setNewDrawerName({ ...newDrawerName, [freezer.id]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addDrawer(freezer.id)}
                  className="flex-1 px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0f1419] text-gray-900 dark:text-[#e6edf3] placeholder-gray-400 dark:placeholder-[#484f59]"
                />
                <button
                  onClick={() => addDrawer(freezer.id)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-[#30363d] text-gray-700 dark:text-[#e6edf3] rounded text-xs hover:bg-gray-200 dark:hover:bg-[#3c444d]"
                >
                  + Tiroir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
