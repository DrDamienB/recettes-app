"use client";

import { markItemAsPurchased } from "../planning/actions";
import { useRouter } from "next/navigation";

type ShoppingItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  storeSection: string;
  storeName: string | null;
  purchased: boolean;
  mealPlans: Array<{ date: Date; slot: string }>;
  relatedItemIds: number[];
};

type ShoppingListData = {
  id: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  groupedByStore: Record<string, Record<string, ShoppingItem[]>>;
};

export default function ShoppingListClient({
  shoppingList,
}: {
  shoppingList: ShoppingListData;
}) {
  const router = useRouter();

  const handleTogglePurchased = async (item: ShoppingItem) => {
    // Marquer tous les items liés (agrégés)
    for (const itemId of item.relatedItemIds) {
      await markItemAsPurchased(itemId, !item.purchased);
    }
    router.refresh();
  };

  const stores = Object.keys(shoppingList.groupedByStore).sort();

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* En-tête fixe optimisé mobile */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="p-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold truncate">Liste de courses</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Du {new Date(shoppingList.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} au{" "}
                {new Date(shoppingList.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex-shrink-0 border px-3 sm:px-4 py-2 rounded hover:bg-gray-50 text-sm sm:text-base print:hidden"
            >
              🖨️
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6 max-w-5xl mx-auto">
        {stores.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
            Aucun ingrédient dans la liste. Tous les items ont peut-être déjà été achetés.
          </p>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {stores.map((storeName) => {
              const sections = Object.keys(shoppingList.groupedByStore[storeName]).sort();

              return (
                <div key={storeName} className="bg-white border-2 border-blue-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                    <h2 className="text-base sm:text-lg font-bold text-blue-700 uppercase">
                      🏪 {storeName}
                    </h2>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {sections.map((section) => {
                      const items = shoppingList.groupedByStore[storeName][section];

                      return (
                        <div key={section} className="p-4">
                          <h3 className="font-semibold text-sm sm:text-base mb-3 capitalize text-gray-700 bg-gray-100 px-3 py-2 rounded-md">
                            📦 {section}
                          </h3>
                          <ul className="space-y-3">
                            {items.map((item) => (
                              <li
                                key={item.id}
                                className="flex items-start gap-3 sm:gap-4 p-2 hover:bg-gray-50 rounded-md transition-colors"
                              >
                                {/* Grande checkbox tactile pour mobile */}
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={item.purchased}
                                    onChange={() => handleTogglePurchased(item)}
                                    className="w-6 h-6 sm:w-7 sm:h-7 cursor-pointer accent-green-600 rounded"
                                  />
                                </label>

                                <div className="flex-1 min-w-0">
                                  <div
                                    className={`text-sm sm:text-base ${
                                      item.purchased ? "line-through text-gray-400" : "text-gray-900"
                                    }`}
                                  >
                                    <strong className="font-semibold">{item.name}</strong>
                                    <span className="text-gray-600"> — {item.quantity.toFixed(1)} {item.unit}</span>
                                  </div>

                                  {item.mealPlans.length > 0 && (
                                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                                      <span className="font-medium">Pour:</span>
                                      {item.mealPlans.map((mp, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs"
                                        >
                                          {new Date(mp.date).toLocaleDateString("fr-FR", {
                                            day: "numeric",
                                            month: "short",
                                          })}{" "}
                                          {mp.slot === "midi" ? "🌞" : "🌙"}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bouton retour fixe en bas sur mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 print:hidden">
        <div className="max-w-5xl mx-auto">
          <a
            href="/planning"
            className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            ← Retour au planning
          </a>
        </div>
      </div>
    </main>
  );
}
