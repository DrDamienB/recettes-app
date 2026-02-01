// Service Worker pour PWA
const CACHE_NAME = 'recettes-app-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Ressources essentielles à mettre en cache immédiatement
const urlsToCache = [
  '/',
  '/recipes',
  '/planning',
  '/shopping-list',
  '/freezer',
  '/offline',
];

// Routes API à mettre en cache pour le mode hors ligne
const API_ROUTES = [
  '/api/shopping-list',
  '/api/recipes',
  '/api/planning',
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation en cours...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Cache statique ouvert');
      return cache.addAll(urlsToCache);
    }).then(() => {
      console.log('[SW] Installation terminée');
      return self.skipWaiting(); // Active immédiatement le nouveau SW
    })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation en cours...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation terminée');
      return self.clients.claim(); // Prend le contrôle de toutes les pages
    })
  );
});

// Stratégie de cache intelligente
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes externes
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Gérer les requêtes POST/PATCH vers l'API shopping-list en mode hors ligne
  if ((request.method === 'POST' || request.method === 'PATCH') && url.pathname.startsWith('/api/shopping-list')) {
    event.respondWith(handleOfflineAction(request));
    return;
  }

  // Ignorer les autres requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Pour la liste de courses : Cache First avec mise à jour en arrière-plan
  if (url.pathname.includes('/shopping-list')) {
    event.respondWith(cacheFirstWithRefresh(request));
    return;
  }

  // Pour les autres pages : Network First avec fallback cache
  event.respondWith(networkFirstWithCache(request));
});

// Cache First avec mise à jour en arrière-plan (pour la liste de courses)
async function cacheFirstWithRefresh(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Retourner le cache immédiatement
  if (cachedResponse) {
    // Mettre à jour le cache en arrière-plan
    fetchAndCache(request, cache);
    return cachedResponse;
  }

  // Si pas de cache, fetch normalement
  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('[SW] Erreur réseau:', error);
    return new Response('Mode hors ligne - Aucune donnée en cache', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network First avec fallback cache (pour les autres pages)
async function networkFirstWithCache(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  try {
    const networkResponse = await fetch(request);

    // Mettre en cache uniquement les réponses réussies
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Pas de réseau, utilisation du cache');
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback vers page offline si disponible
    return cache.match('/offline') || new Response('Hors ligne', { status: 503 });
  }
}

// Fonction helper pour mettre à jour le cache en arrière-plan
async function fetchAndCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
  } catch (error) {
    // Ignorer les erreurs de mise à jour en arrière-plan
  }
}

// Gestion des actions hors ligne (POST/PATCH)
async function handleOfflineAction(request) {
  try {
    // Essayer d'abord d'envoyer la requête
    const response = await fetch(request.clone());
    return response;
  } catch (error) {
    // Si hors ligne, stocker l'action dans IndexedDB
    console.log('[SW] Hors ligne, stockage de l\'action');

    const body = await request.clone().json();
    const action = {
      url: request.url,
      method: request.method,
      body: body,
      timestamp: Date.now(),
    };

    await addToOfflineQueue(action);

    // Retourner une réponse simulée de succès
    return new Response(
      JSON.stringify({ success: true, offline: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Ajouter une action à la queue hors ligne
async function addToOfflineQueue(action) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offline-queue'], 'readwrite');
    const store = transaction.objectStore('offline-queue');
    const request = store.add(action);

    request.onsuccess = () => {
      console.log('[SW] Action ajoutée à la queue');
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// Ouvrir ou créer la base de données IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('recettes-offline-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offline-queue')) {
        db.createObjectStore('offline-queue', {
          keyPath: 'timestamp',
          autoIncrement: true,
        });
      }
    };
  });
}

// Synchroniser la queue quand la connexion revient
async function syncOfflineQueue() {
  console.log('[SW] Synchronisation de la queue hors ligne');
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offline-queue'], 'readonly');
    const store = transaction.objectStore('offline-queue');
    const request = store.getAll();

    request.onsuccess = async () => {
      const actions = request.result;
      console.log('[SW] Actions à synchroniser:', actions.length);

      for (const action of actions) {
        try {
          await fetch(action.url, {
            method: action.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(action.body),
          });

          // Supprimer l'action de la queue
          const deleteTransaction = db.transaction(['offline-queue'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('offline-queue');
          deleteStore.delete(action.timestamp);

          console.log('[SW] Action synchronisée:', action.url);
        } catch (error) {
          console.error('[SW] Erreur lors de la sync:', error);
        }
      }

      resolve();
    };

    request.onerror = () => reject(request.error);
  });
}

// Écouter les événements de synchronisation
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(syncOfflineQueue());
  }
});

// Écouter les messages depuis le client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_QUEUE') {
    console.log('[SW] Message reçu: synchronisation manuelle');
    syncOfflineQueue();
  }
  if (event.data && event.data.type === 'CHECK_EXPIRING') {
    checkExpiringItems();
  }
});

// Vérifier les items du congélateur qui périment bientôt
async function checkExpiringItems() {
  try {
    const response = await fetch('/api/freezer-items/expiring');
    if (!response.ok) return;
    const data = await response.json();

    if (data.totalUrgent > 0) {
      const lastNotif = await getLastNotificationDate();
      const today = new Date().toISOString().split('T')[0];

      // Max 1 notification par jour
      if (lastNotif === today) return;

      const expiredCount = data.expired.length;
      const expiringCount = data.expiring.length;

      let body = '';
      if (expiredCount > 0) body += `${expiredCount} produit(s) expiré(s). `;
      if (expiringCount > 0) body += `${expiringCount} produit(s) expirent dans les 15 jours.`;

      self.registration.showNotification('Congélateur', {
        body: body.trim(),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'freezer-expiring',
        data: { url: '/freezer' },
      });

      await setLastNotificationDate(today);
    }
  } catch (error) {
    console.error('[SW] Erreur vérification péremption:', error);
  }
}

async function getLastNotificationDate() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(['offline-queue'], 'readonly');
      const store = tx.objectStore('offline-queue');
      const req = store.get('last-freezer-notif');
      req.onsuccess = () => resolve(req.result?.date || null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

async function setLastNotificationDate(date) {
  try {
    const db = await openDB();
    const tx = db.transaction(['offline-queue'], 'readwrite');
    const store = tx.objectStore('offline-queue');
    store.put({ timestamp: 'last-freezer-notif', date });
  } catch { /* ignore */ }
}

// Ouvrir la page au clic sur notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
