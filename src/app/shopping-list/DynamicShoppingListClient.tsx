"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDynamicShoppingList } from "./actions";
import { useOfflineSync } from "@/hooks/useOfflineSync";

type IngredientGroup = {
  name: string;
  quantity: number;
  unit: string;
  storeSection: string;
  storeName: string;
  checked: boolean;
  mealPlans: Array<{ date: string; slot: string; recipeTitle: string }>;
};

type ShoppingData = {
  startDate: string;
  endDate: string;
  groupedByStore: Record<string, Record<string, IngredientGroup[]>>;
  totalItems: number;
};

export default function DynamicShoppingListClient({
  initialData,
}: {
  initialData: ShoppingData;
}) {
  const router = useRouter();
  const { isOnline, hasPendingSync } = useOfflineSync();
  const [data, setData] = useState<ShoppingData>(initialData);
  const [expandedStores, setExpandedStores] = useState<Record<string, boolean>>({});
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Recharger automatiquement toutes les 30 secondes si en ligne
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(async () => {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);

      const newData = await getDynamicShoppingList(today, endDate);
      setData(newData);
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [isOnline]);

  // Fonction de rafraîchissement manuel
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);

    const newData = await getDynamicShoppingList(today, endDate);
    setData(newData);
    setIsRefreshing(false);
  };

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      // Sauvegarder dans localStorage
      localStorage.setItem("shopping-checked", JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const toggleExpandStore = (storeName: string) => {
    setExpandedStores((prev) => ({
      ...prev,
      [storeName]: !prev[storeName],
    }));
  };

  // Charger les items cochés depuis localStorage au montage
  useEffect(() => {
    const saved = localStorage.getItem("shopping-checked");
    if (saved) {
      try {
        setCheckedItems(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Erreur chargement checked items:", e);
      }
    }
  }, []);

  const stores = Object.keys(data.groupedByStore).sort();

  return (
    <main className="pb-20">
      {/* En-tête compact */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-[#e6edf3]">
            Liste de courses
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#8b949e] mt-0.5">
            {new Date(data.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} - {new Date(data.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-gray-100 dark:bg-[#1c2128] hover:bg-gray-200 dark:hover:bg-[#30363d] transition-colors disabled:opacity-50"
          title="Actualiser"
        >
          <span className={isRefreshing ? "animate-spin inline-block" : ""}>
            🔄
          </span>
        </button>
      </div>

      {/* Indicateur de statut compact */}
      {!isOnline && (
        <div className="mb-3 px-3 py-2 rounded-lg flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <span>📵</span>
          <span className="text-amber-900 dark:text-amber-200">Hors ligne</span>
        </div>
      )}

      {/* Liste vide */}
      {data.totalItems === 0 && (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🛒</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-[#e6edf3] mb-1">
            Aucun repas planifié
          </h2>
          <p className="text-sm text-gray-600 dark:text-[#8b949e]">
            Ajoutez des repas à votre planning
          </p>
        </div>
      )}

      {/* Liste par magasin */}
      {stores.map((storeName) => {
        const sections = data.groupedByStore[storeName];
        const sectionKeys = Object.keys(sections).sort();

        const storeItems = sectionKeys.flatMap((section) => sections[section]);
        const storeChecked = storeItems.filter((item) =>
          checkedItems.has(`${item.name}-${item.unit}-${item.storeSection}-${item.storeName}`)
        ).length;
        const storeTotal = storeItems.length;
        const isExpanded = expandedStores[storeName] ?? true;

        return (
          <div
            key={storeName}
            className="mb-3 bg-white dark:bg-[#0f1419] border border-gray-200 dark:border-[#30363d] rounded-lg overflow-hidden"
          >
            {/* En-tête magasin */}
            <button
              onClick={() => toggleExpandStore(storeName)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1c2128] hover:bg-gray-100 dark:hover:bg-[#30363d] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🏪</span>
                <div className="text-left">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-[#e6edf3]">
                    {storeName}
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-[#8b949e]">
                    {storeChecked} / {storeTotal}
                  </p>
                </div>
              </div>
              <span className="text-gray-500 dark:text-[#8b949e]">
                {isExpanded ? "▼" : "▶"}
              </span>
            </button>

            {/* Contenu par rayon */}
            {isExpanded && (
              <div className="p-3 space-y-3">
                {sectionKeys.map((sectionName) => (
                  <div key={sectionName}>
                    <h3 className="text-xs font-medium text-gray-600 dark:text-[#8b949e] mb-1.5 uppercase">
                      {sectionName}
                    </h3>
                    <ul className="space-y-1.5">
                      {sections[sectionName].map((item) => {
                        const itemKey = `${item.name}-${item.unit}-${item.storeSection}-${item.storeName}`;
                        const isChecked = checkedItems.has(itemKey);

                        return (
                          <li
                            key={itemKey}
                            className="flex items-start gap-2 py-1.5"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCheck(itemKey)}
                              className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-[#30363d] text-indigo-600 focus:ring-indigo-500 dark:bg-[#0f1419] cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm ${
                                  isChecked
                                    ? "line-through text-gray-400 dark:text-[#484f59]"
                                    : "text-gray-900 dark:text-[#e6edf3]"
                                }`}
                              >
                                {item.name} · {item.quantity.toFixed(item.quantity % 1 === 0 ? 0 : 1)} {item.unit}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-[#8b949e] truncate">
                                {item.mealPlans.map((mp, i) => (
                                  <span key={i}>
                                    {i > 0 && ", "}
                                    {mp.recipeTitle}
                                  </span>
                                ))}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </main>
  );
}
