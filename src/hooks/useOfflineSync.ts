"use client";

import { useEffect, useState, useCallback } from "react";

export function useOfflineSync(shoppingListId?: number) {
  const [isOnline, setIsOnline] = useState(true);
  const [hasPendingSync, setHasPendingSync] = useState(false);

  // Écouter les changements de statut réseau
  useEffect(() => {
    const handleOnline = () => {
      console.log("[Offline] Connexion rétablie");
      setIsOnline(true);
      // Déclencher la synchronisation via le Service Worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_QUEUE'
        });
      }
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

  // Vérifier s'il y a des actions en attente dans IndexedDB
  const checkPendingActions = useCallback(async () => {
    if (!('indexedDB' in window)) {
      return;
    }

    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('recettes-offline-db', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      const transaction = db.transaction(['offline-queue'], 'readonly');
      const store = transaction.objectStore('offline-queue');
      const request = store.getAll();

      request.onsuccess = () => {
        setHasPendingSync(request.result.length > 0);
      };
    } catch (error) {
      console.error('[Offline] Erreur vérification queue:', error);
    }
  }, []);

  // Vérifier au chargement et périodiquement
  useEffect(() => {
    checkPendingActions();
    const interval = setInterval(checkPendingActions, 5000);
    return () => clearInterval(interval);
  }, [checkPendingActions]);

  return {
    isOnline,
    hasPendingSync,
    checkPendingActions,
  };
}
