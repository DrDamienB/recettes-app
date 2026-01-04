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
  const totalChecked = checkedItems.size;
  const progressPercent = data.totalItems > 0 ? Math.round((totalChecked / data.totalItems) * 100) : 0;

  return (
    <main className="pb-24">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e6edf3]">
            Liste de courses
          </h1>
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
        <p className="text-gray-600 dark:text-[#8b949e]">
          Du {new Date(data.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} au{" "}
          {new Date(data.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · Mise à jour automatique
        </p>

        {/* Indicateur de statut */}
        {(!isOnline || hasPendingSync) && (
          <div
            className={`mt-3 px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
              !isOnline
                ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            }`}
          >
            <span>{!isOnline ? "📵" : "🔄"}</span>
            <span className={!isOnline ? "text-amber-900 dark:text-amber-200" : "text-blue-900 dark:text-blue-200"}>
              {!isOnline ? "Mode hors ligne" : "Synchronisation en cours..."}
            </span>
          </div>
        )}

        {/* Barre de progression */}
        <div className="mt-4 bg-gray-200 dark:bg-[#30363d] rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-[#8b949e] mt-1">
          {totalChecked} / {data.totalItems} articles ({progressPercent}%)
        </p>
      </div>

      {/* Liste vide */}
      {data.totalItems === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-[#e6edf3] mb-2">
            Aucun repas planifié
          </h2>
          <p className="text-gray-600 dark:text-[#8b949e]">
            Ajoutez des repas à votre planning pour générer votre liste de courses
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
            className="mb-4 bg-white dark:bg-[#0f1419] border border-gray-200 dark:border-[#30363d] rounded-lg overflow-hidden shadow-sm"
          >
            {/* En-tête magasin */}
            <button
              onClick={() => toggleExpandStore(storeName)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1c2128] hover:bg-gray-100 dark:hover:bg-[#30363d] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏪</span>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-[#e6edf3]">
                    {storeName}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-[#8b949e]">
                    {storeChecked} / {storeTotal} articles
                  </p>
                </div>
              </div>
              <span className="text-gray-500 dark:text-[#8b949e] text-xl">
                {isExpanded ? "▼" : "▶"}
              </span>
            </button>

            {/* Contenu par rayon */}
            {isExpanded && (
              <div className="p-4 space-y-4">
                {sectionKeys.map((sectionName) => (
                  <div key={sectionName}>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-[#8b949e] mb-2 uppercase tracking-wide">
                      {sectionName}
                    </h3>
                    <ul className="space-y-2">
                      {sections[sectionName].map((item) => {
                        const itemKey = `${item.name}-${item.unit}-${item.storeSection}-${item.storeName}`;
                        const isChecked = checkedItems.has(itemKey);

                        return (
                          <li
                            key={itemKey}
                            className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-[#1c2128] transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCheck(itemKey)}
                              className="mt-1 h-5 w-5 rounded border-gray-300 dark:border-[#30363d] text-indigo-600 focus:ring-indigo-500 dark:bg-[#0f1419] cursor-pointer"
                            />
                            <div className="flex-1">
                              <p
                                className={`font-medium ${
                                  isChecked
                                    ? "line-through text-gray-400 dark:text-[#484f59]"
                                    : "text-gray-900 dark:text-[#e6edf3]"
                                }`}
                              >
                                {item.name} · {item.quantity.toFixed(item.quantity % 1 === 0 ? 0 : 1)} {item.unit}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-0.5">
                                {item.mealPlans.map((mp, i) => (
                                  <span key={i}>
                                    {i > 0 && ", "}
                                    {mp.recipeTitle} ({new Date(mp.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })})
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
