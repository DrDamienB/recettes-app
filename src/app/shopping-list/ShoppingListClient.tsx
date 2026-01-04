"use client";

import { markItemAsPurchased, deleteCompletedItemsForStore } from "../planning/actions";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

type ShoppingItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  storeSection: string;
  storeName: string | null;
  purchased: boolean;
  mealPlans: Array<{ date: string; slot: string }>;
  relatedItemIds: number[];
};

type ShoppingListData = {
  id: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  groupedByStore: Record<string, Record<string, ShoppingItem[]>>;
};

// Modal de confirmation
function ConfirmModal({
  isOpen,
  storeName,
  itemCount,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  storeName: string;
  itemCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Courses terminées ?
          </h2>
          <p className="text-gray-600">
            Voulez-vous supprimer définitivement les <strong>{itemCount}</strong> article{itemCount > 1 ? 's' : ''} acheté{itemCount > 1 ? 's' : ''} pour <strong>{storeName}</strong> ?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Cette action est irréversible.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-md"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShoppingListClient({
  shoppingList,
}: {
  shoppingList: ShoppingListData;
}) {
  const router = useRouter();
  const [expandedStores, setExpandedStores] = useState<Record<string, boolean>>({});
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    storeName: string;
    itemCount: number;
  }>({ isOpen: false, storeName: "", itemCount: 0 });

  // Hook pour gérer le mode hors ligne
  const { isOnline, addPendingAction, getLocalState, syncPendingActions, hasPendingActions } =
    useOfflineSync(shoppingList.id);

  // Synchroniser automatiquement quand la connexion revient
  useEffect(() => {
    if (isOnline && hasPendingActions) {
      console.log("[Shopping] Connexion rétablie, synchronisation...");
      syncPendingActions(async (itemId, purchased) => {
        await markItemAsPurchased(itemId, purchased);
      });
    }
  }, [isOnline, hasPendingActions, syncPendingActions]);

  const handleTogglePurchased = async (item: ShoppingItem) => {
    const newState = !item.purchased;

    // Mode hors ligne : sauvegarder localement
    if (!isOnline) {
      console.log("[Shopping] Mode hors ligne, sauvegarde locale");
      for (const itemId of item.relatedItemIds) {
        addPendingAction(itemId, newState);
      }
      // Recharger la page pour afficher l'état local
      router.refresh();
      return;
    }

    // Mode en ligne : update serveur directement
    try {
      for (const itemId of item.relatedItemIds) {
        await markItemAsPurchased(itemId, newState);
      }
    } catch (error) {
      console.error("[Shopping] Erreur serveur, sauvegarde locale", error);
      // En cas d'erreur réseau, sauvegarder localement
      for (const itemId of item.relatedItemIds) {
        addPendingAction(itemId, newState);
      }
    }
  };

  // Obtenir l'état effectif d'un item (serveur ou local)
  const getItemPurchasedState = (item: ShoppingItem): boolean => {
    // Utiliser l'état local si disponible, sinon l'état serveur
    return getLocalState(item.id, item.purchased);
  };

  const toggleExpandStore = (storeName: string) => {
    setExpandedStores(prev => ({
      ...prev,
      [storeName]: !prev[storeName]
    }));
  };

  const handleFinishShopping = (storeName: string, itemCount: number) => {
    setModalState({ isOpen: true, storeName, itemCount });
  };

  const confirmFinishShopping = async () => {
    const { storeName } = modalState;
    setModalState({ isOpen: false, storeName: "", itemCount: 0 });

    const result = await deleteCompletedItemsForStore(shoppingList.id, storeName);

    if (result.success) {
      // Toast de succès (simple alert pour l'instant)
      alert(`✅ Courses terminées pour ${storeName} ! ${result.deletedCount} article(s) supprimé(s).`);
      // revalidatePath est déjà appelé dans la server action
    } else {
      alert(`❌ Erreur : ${result.error}`);
    }
  };

  const stores = Object.keys(shoppingList.groupedByStore).sort();

  return (
    <>
      <main className="pb-24">
        {/* En-tête harmonisé avec la page recettes */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e6edf3]">Liste de courses</h1>
            <p className="text-gray-600 dark:text-[#8b949e] mt-1">
              Semaine du {new Date(shoppingList.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} au{" "}
              {new Date(shoppingList.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>

        {/* Indicateur de statut réseau */}
        {(!isOnline || hasPendingActions) && (
          <div className={`mb-4 px-4 py-3 rounded-lg flex items-center gap-3 ${
            !isOnline
              ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          }`}>
            <span className="text-2xl">
              {!isOnline ? '📵' : '🔄'}
            </span>
            <div className="flex-1">
              <p className={`font-medium ${
                !isOnline
                  ? 'text-amber-900 dark:text-amber-200'
                  : 'text-blue-900 dark:text-blue-200'
              }`}>
                {!isOnline ? 'Mode hors ligne' : 'Synchronisation en cours...'}
              </p>
              <p className={`text-sm ${
                !isOnline
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-blue-700 dark:text-blue-300'
              }`}>
                {!isOnline
                  ? 'Vos modifications seront enregistrées localement et synchronisées automatiquement.'
                  : 'Envoi de vos modifications au serveur...'}
              </p>
            </div>
          </div>
        )}

        <div>
          {stores.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Liste vide !
              </h2>
              <p className="text-gray-600">
                Aucun ingrédient dans la liste. Tous les items ont peut-être déjà été achetés.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {stores.map((storeName) => {
                const sections = Object.keys(shoppingList.groupedByStore[storeName]).sort();
                const allItems = sections.flatMap(section => shoppingList.groupedByStore[storeName][section]);
                const activeItems = allItems.filter(item => !item.purchased);
                const completedItems = allItems.filter(item => item.purchased);
                const isExpanded = expandedStores[storeName] !== false; // Par défaut déplié

                return (
                  <div key={storeName} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
                    {/* Header du magasin simplifié */}
                    <div className="bg-gray-50 dark:bg-[#1c2128] px-6 py-4 border-b">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-[#e6edf3]">
                        {storeName}
                      </h2>
                    </div>

                    <div className="p-6">
                      {/* Section À ACHETER */}
                      {activeItems.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            📝 À acheter
                            <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-semibold">
                              {activeItems.length}
                            </span>
                          </h3>

                          {/* Items groupés par rayon */}
                          {sections.map((section) => {
                            const sectionActiveItems = shoppingList.groupedByStore[storeName][section].filter(item => !item.purchased);
                            if (sectionActiveItems.length === 0) return null;

                            return (
                              <div key={section} className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 px-2">
                                  📦 {section}
                                </h4>
                                <ul className="space-y-2">
                                  {sectionActiveItems.map((item) => (
                                    <li key={item.id}>
                                      <label className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <input
                                          type="checkbox"
                                          checked={getItemPurchasedState(item)}
                                          onChange={() => handleTogglePurchased(item)}
                                          className="mt-0.5 h-6 w-6 sm:h-7 sm:w-7 rounded-md border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer checked:bg-indigo-600 checked:border-indigo-600 transition-all"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm sm:text-base text-gray-900">
                                            <span className="font-semibold">{item.name}</span>
                                            <span className="text-gray-600"> — </span>
                                            <span className="text-gray-700">{item.quantity.toFixed(1)} {item.unit}</span>
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
                                      </label>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Section DÉJÀ ACHETÉ (collapsible) */}
                      {completedItems.length > 0 && (
                        <div className="border-t pt-6">
                          <button
                            onClick={() => toggleExpandStore(storeName)}
                            className="w-full text-left mb-4 flex items-center justify-between group"
                          >
                            <h3 className="text-lg sm:text-xl font-bold text-gray-700 flex items-center gap-2 group-hover:text-gray-900 transition-colors">
                              {isExpanded ? '▼' : '▶'} ✅ Déjà acheté
                              <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-semibold">
                                {completedItems.length}
                              </span>
                            </h3>
                          </button>

                          {isExpanded && (
                            <div className="opacity-60">
                              {sections.map((section) => {
                                const sectionCompletedItems = shoppingList.groupedByStore[storeName][section].filter(item => item.purchased);
                                if (sectionCompletedItems.length === 0) return null;

                                return (
                                  <div key={section} className="mb-6">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
                                      📦 {section}
                                    </h4>
                                    <ul className="space-y-2">
                                      {sectionCompletedItems.map((item) => (
                                        <li key={item.id}>
                                          <label className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                            <input
                                              type="checkbox"
                                              checked={getItemPurchasedState(item)}
                                              onChange={() => handleTogglePurchased(item)}
                                              className="mt-0.5 h-6 w-6 sm:h-7 sm:w-7 rounded-md border-2 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer checked:bg-green-600 checked:border-green-600"
                                            />
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm sm:text-base text-gray-500 line-through">
                                                <span className="font-semibold">{item.name}</span>
                                                <span> — </span>
                                                <span>{item.quantity.toFixed(1)} {item.unit}</span>
                                              </div>
                                            </div>
                                          </label>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bouton Courses terminées */}
                      {completedItems.length > 0 && (
                        <div className="mt-8">
                          <button
                            onClick={() => handleFinishShopping(storeName, completedItems.length)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 sm:py-5 rounded-xl shadow-lg hover:shadow-xl transition-all text-base sm:text-lg flex items-center justify-center gap-2"
                          >
                            <span className="text-2xl">🎉</span>
                            <span>Courses terminées !</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bouton retour fixe en bas */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-5xl mx-auto">
            <a
              href="/planning"
              className="block w-full text-center px-4 py-3 sm:py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors text-base sm:text-lg"
            >
              ← Retour au planning
            </a>
          </div>
        </div>
      </main>

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        storeName={modalState.storeName}
        itemCount={modalState.itemCount}
        onConfirm={confirmFinishShopping}
        onCancel={() => setModalState({ isOpen: false, storeName: "", itemCount: 0 })}
      />
    </>
  );
}
