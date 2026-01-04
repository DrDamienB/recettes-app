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

  // Ignorer les requêtes non-GET et les requêtes externes
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
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
