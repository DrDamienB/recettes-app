"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { type Freezer, type FreezerItem, ITEM_TYPES, getTypeInfo, getExpirationStatus } from "./types";
import DroppableDrawer from "./DroppableDrawer";
import DraggableItem from "./DraggableItem";
import ItemCard from "./ItemCard";
import AddItemModal from "./AddItemModal";
import MoveItemModal from "./MoveItemModal";
import FreezerSettings from "./FreezerSettings";

type SortMode = "location" | "type" | "expiration";
type FilterType = string | null;

export default function FreezerClient({ initialData }: { initialData: Freezer[] }) {
  const searchParams = useSearchParams();
  const [freezers, setFreezers] = useState<Freezer[]>(initialData);
  const [activeItem, setActiveItem] = useState<FreezerItem | null>(null);
  const [showAddModal, setShowAddModal] = useState<{ drawerId: number; freezerId: number } | null>(null);
  const [showMoveModal, setShowMoveModal] = useState<FreezerItem | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("location");
  const [filterType, setFilterType] = useState<FilterType>(null);
  const [filterFreezer, setFilterFreezer] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFreezers, setExpandedFreezers] = useState<Record<number, boolean>>({});
  const [expandedDrawers, setExpandedDrawers] = useState<Record<number, boolean>>({});

  // Demander permission notifications + vérifier péremption
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "CHECK_EXPIRING" });
    }
  }, []);

  // Deep link NFC : ouvrir un congélateur/tiroir spécifique
  useEffect(() => {
    const freezerParam = searchParams.get("freezer");
    const drawerParam = searchParams.get("drawer");

    if (freezerParam) {
      const fId = parseInt(freezerParam);
      setFilterFreezer(fId);
      setExpandedFreezers((prev) => ({ ...prev, [fId]: true }));

      if (drawerParam) {
        const dId = parseInt(drawerParam);
        setExpandedDrawers((prev) => ({ ...prev, [dId]: true }));
      }
    } else {
      // Ouvrir tous les congélateurs par défaut
      const expanded: Record<number, boolean> = {};
      freezers.forEach((f) => { expanded[f.id] = true; });
      setExpandedFreezers(expanded);
    }
  }, [searchParams]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const refreshData = useCallback(async () => {
    const res = await fetch("/api/freezers");
    const data = await res.json();
    setFreezers(data);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = findItem(active.id as number);
    setActiveItem(item || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const itemId = active.id as number;
    const targetDrawerId = over.id as number;

    const item = findItem(itemId);
    if (!item || item.drawerId === targetDrawerId) return;

    // Optimistic update
    setFreezers((prev) =>
      prev.map((f) => ({
        ...f,
        drawers: f.drawers.map((d) => ({
          ...d,
          items:
            d.id === item.drawerId
              ? d.items.filter((i) => i.id !== itemId)
              : d.id === targetDrawerId
              ? [...d.items, { ...item, drawerId: targetDrawerId }]
              : d.items,
        })),
      }))
    );

    await fetch(`/api/freezer-items/${itemId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drawerId: targetDrawerId }),
    });
  };

  const findItem = (itemId: number): FreezerItem | undefined => {
    for (const f of freezers) {
      for (const d of f.drawers) {
        const item = d.items.find((i) => i.id === itemId);
        if (item) return item;
      }
    }
    return undefined;
  };

  const handleDeleteItem = async (itemId: number) => {
    setFreezers((prev) =>
      prev.map((f) => ({
        ...f,
        drawers: f.drawers.map((d) => ({
          ...d,
          items: d.items.filter((i) => i.id !== itemId),
        })),
      }))
    );
    await fetch(`/api/freezer-items/${itemId}`, { method: "DELETE" });
  };

  const handleQuantityChange = async (itemId: number, delta: number) => {
    setFreezers((prev) =>
      prev.map((f) => ({
        ...f,
        drawers: f.drawers.map((d) => ({
          ...d,
          items: d.items.map((i) =>
            i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
          ),
        })),
      }))
    );
    const item = findItem(itemId);
    if (item) {
      await fetch(`/api/freezer-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: Math.max(1, item.quantity + delta) }),
      });
    }
  };

  // Filtrer et trier les items
  const getFilteredItems = (items: FreezerItem[]) => {
    let filtered = items;
    if (filterType) filtered = filtered.filter((i) => i.type === filterType);
    if (searchQuery) filtered = filtered.filter((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (sortMode === "expiration") {
      filtered = [...filtered].sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
    } else if (sortMode === "type") {
      filtered = [...filtered].sort((a, b) => a.type.localeCompare(b.type));
    }

    return filtered;
  };

  const filteredFreezers = filterFreezer ? freezers.filter((f) => f.id === filterFreezer) : freezers;

  // Compter les items urgents
  const urgentCount = freezers.reduce(
    (acc, f) =>
      acc +
      f.drawers.reduce(
        (acc2, d) => acc2 + d.items.filter((i) => getExpirationStatus(i.expirationDate).urgent).length,
        0
      ),
    0
  );

  const totalItems = freezers.reduce(
    (acc, f) => acc + f.drawers.reduce((acc2, d) => acc2 + d.items.length, 0),
    0
  );

  if (showSettings) {
    return (
      <FreezerSettings
        freezers={freezers}
        onBack={() => {
          setShowSettings(false);
          refreshData();
        }}
      />
    );
  }

  return (
    <main className="pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-[#e6edf3]">
            Congélateur
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#8b949e] mt-0.5">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
            {urgentCount > 0 && (
              <span className="text-red-600 dark:text-red-400 ml-2">
                ({urgentCount} bientôt périmé{urgentCount !== 1 ? "s" : ""})
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-[#1c2128] hover:bg-gray-200 dark:hover:bg-[#30363d] transition-colors"
          title="Gérer congélateurs"
        >
          <span>⚙️</span>
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="mb-3 space-y-2">
        {/* Recherche */}
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0f1419] text-gray-900 dark:text-[#e6edf3] placeholder-gray-400 dark:placeholder-[#484f59] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        {/* Filtres en ligne */}
        <div className="flex flex-wrap gap-1.5">
          {/* Filtre congélateur */}
          <select
            value={filterFreezer || ""}
            onChange={(e) => setFilterFreezer(e.target.value ? parseInt(e.target.value) : null)}
            className="px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0f1419] text-gray-700 dark:text-[#e6edf3]"
          >
            <option value="">Tous</option>
            {freezers.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          {/* Filtre type */}
          <select
            value={filterType || ""}
            onChange={(e) => setFilterType(e.target.value || null)}
            className="px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0f1419] text-gray-700 dark:text-[#e6edf3]"
          >
            <option value="">Tous types</option>
            {ITEM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          {/* Tri */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0f1419] text-gray-700 dark:text-[#e6edf3]"
          >
            <option value="location">Par emplacement</option>
            <option value="expiration">Par péremption</option>
            <option value="type">Par type</option>
          </select>
        </div>
      </div>

      {/* Empty state */}
      {freezers.length === 0 && (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🧊</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-[#e6edf3] mb-1">
            Aucun congélateur
          </h2>
          <p className="text-sm text-gray-600 dark:text-[#8b949e] mb-4">
            Commencez par ajouter un congélateur
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            Ajouter un congélateur
          </button>
        </div>
      )}

      {/* Kanban / Accordéon */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Desktop: Kanban horizontal */}
        <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
          {filteredFreezers.map((freezer) => (
            <div
              key={freezer.id}
              className="min-w-[300px] flex-shrink-0 bg-gray-50 dark:bg-[#1c2128] rounded-lg border border-gray-200 dark:border-[#30363d]"
            >
              <div className="p-3 border-b border-gray-200 dark:border-[#30363d]">
                <h2 className="text-base font-semibold text-gray-900 dark:text-[#e6edf3]">
                  🧊 {freezer.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-[#8b949e]">
                  {freezer.drawers.reduce((a, d) => a + d.items.length, 0)} items
                </p>
              </div>
              <div className="p-2 space-y-2 max-h-[70vh] overflow-y-auto">
                {freezer.drawers.map((drawer) => (
                  <DroppableDrawer key={drawer.id} drawer={drawer}>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-xs font-medium text-gray-600 dark:text-[#8b949e] uppercase">
                        {drawer.name}
                      </h3>
                      <button
                        onClick={() => setShowAddModal({ drawerId: drawer.id, freezerId: freezer.id })}
                        className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {getFilteredItems(drawer.items).map((item) => (
                        <DraggableItem key={item.id} item={item}>
                          <ItemCard
                            item={item}
                            onDelete={() => handleDeleteItem(item.id)}
                            onQuantityChange={(d) => handleQuantityChange(item.id, d)}
                            onMove={() => setShowMoveModal(item)}
                            compact
                          />
                        </DraggableItem>
                      ))}
                    </div>
                  </DroppableDrawer>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Accordéon */}
        <div className="md:hidden space-y-3">
          {filteredFreezers.map((freezer) => {
            const isExpanded = expandedFreezers[freezer.id] ?? true;
            const itemCount = freezer.drawers.reduce((a, d) => a + d.items.length, 0);

            return (
              <div
                key={freezer.id}
                className="bg-white dark:bg-[#0f1419] border border-gray-200 dark:border-[#30363d] rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFreezers((prev) => ({ ...prev, [freezer.id]: !prev[freezer.id] }))}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1c2128] hover:bg-gray-100 dark:hover:bg-[#30363d] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧊</span>
                    <div className="text-left">
                      <h2 className="text-base font-semibold text-gray-900 dark:text-[#e6edf3]">
                        {freezer.name}
                      </h2>
                      <p className="text-xs text-gray-600 dark:text-[#8b949e]">{itemCount} items</p>
                    </div>
                  </div>
                  <span className="text-gray-500 dark:text-[#8b949e]">{isExpanded ? "▼" : "▶"}</span>
                </button>

                {isExpanded && (
                  <div className="p-3 space-y-3">
                    {freezer.drawers.map((drawer) => {
                      const drawerExpanded = expandedDrawers[drawer.id] ?? true;
                      const filteredItems = getFilteredItems(drawer.items);

                      return (
                        <div key={drawer.id}>
                          <button
                            onClick={() => setExpandedDrawers((prev) => ({ ...prev, [drawer.id]: !prev[drawer.id] }))}
                            className="flex items-center justify-between w-full mb-1.5"
                          >
                            <h3 className="text-xs font-medium text-gray-600 dark:text-[#8b949e] uppercase">
                              {drawer.name} ({filteredItems.length})
                            </h3>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowAddModal({ drawerId: drawer.id, freezerId: freezer.id });
                                }}
                                className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                              >
                                +
                              </button>
                              <span className="text-xs text-gray-400 dark:text-[#484f59]">
                                {drawerExpanded ? "▼" : "▶"}
                              </span>
                            </div>
                          </button>

                          {drawerExpanded && (
                            <div className="space-y-1.5">
                              {filteredItems.map((item) => (
                                <ItemCard
                                  key={item.id}
                                  item={item}
                                  onDelete={() => handleDeleteItem(item.id)}
                                  onQuantityChange={(d) => handleQuantityChange(item.id, d)}
                                  onMove={() => setShowMoveModal(item)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeItem && (
            <ItemCard item={activeItem} onDelete={() => {}} onQuantityChange={() => {}} onMove={() => {}} compact />
          )}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      {showAddModal && (
        <AddItemModal
          drawerId={showAddModal.drawerId}
          onClose={() => setShowAddModal(null)}
          onAdded={refreshData}
        />
      )}

      {showMoveModal && (
        <MoveItemModal
          item={showMoveModal}
          freezers={freezers}
          onClose={() => setShowMoveModal(null)}
          onMoved={refreshData}
        />
      )}
    </main>
  );
}
