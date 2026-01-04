"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY_PREFIX = "offline_shopping_";

type PendingAction = {
  itemId: number;
  purchased: boolean;
  timestamp: number;
};

export function useOfflineSync(shoppingListId: number) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const storageKey = `${STORAGE_KEY_PREFIX}${shoppingListId}`;

  // Charger les actions en attente depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPendingActions(parsed);
      } catch (e) {
        console.error("Erreur parsing localStorage:", e);
      }
    }
  }, [storageKey]);

  // Écouter les changements de statut réseau
  useEffect(() => {
    const handleOnline = () => {
      console.log("[Offline] Connexion rétablie");
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log("[Offline] Connexion perdue");
      setIsOnline(false);
    };

    // État initial
    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sauvegarder les actions en attente dans localStorage
  const savePendingActions = useCallback((actions: PendingAction[]) => {
    localStorage.setItem(storageKey, JSON.stringify(actions));
    setPendingActions(actions);
  }, [storageKey]);

  // Ajouter une action en attente (mode hors ligne)
  const addPendingAction = useCallback((itemId: number, purchased: boolean) => {
    const newAction: PendingAction = {
      itemId,
      purchased,
      timestamp: Date.now(),
    };

    setPendingActions((prev) => {
      // Remplacer l'action existante pour le même item
      const filtered = prev.filter((a) => a.itemId !== itemId);
      const updated = [...filtered, newAction];
      savePendingActions(updated);
      return updated;
    });
  }, [savePendingActions]);

  // Obtenir l'état local d'un item (pour l'optimistic UI)
  const getLocalState = useCallback((itemId: number, serverState: boolean): boolean => {
    const pending = pendingActions.find((a) => a.itemId === itemId);
    return pending ? pending.purchased : serverState;
  }, [pendingActions]);

  // Synchroniser les actions en attente avec le serveur
  const syncPendingActions = useCallback(async (
    syncFunction: (itemId: number, purchased: boolean) => Promise<void>
  ) => {
    if (pendingActions.length === 0 || !isOnline) {
      return;
    }

    console.log(`[Offline] Synchronisation de ${pendingActions.length} action(s)...`);

    const actionsToSync = [...pendingActions];

    for (const action of actionsToSync) {
      try {
        await syncFunction(action.itemId, action.purchased);
      } catch (error) {
        console.error("[Offline] Erreur sync:", error);
        // En cas d'erreur, garder l'action pour réessayer plus tard
        return;
      }
    }

    // Toutes les actions ont été synchronisées avec succès
    console.log("[Offline] Synchronisation réussie");
    localStorage.removeItem(storageKey);
    setPendingActions([]);
  }, [pendingActions, isOnline, storageKey]);

  return {
    isOnline,
    pendingActions,
    addPendingAction,
    getLocalState,
    syncPendingActions,
    hasPendingActions: pendingActions.length > 0,
  };
}
