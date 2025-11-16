# Configuration PWA - Recettes App

## Fichiers créés

### 1. `/public/manifest.json`
Manifeste de l'application PWA avec :
- Nom de l'app : "Recettes App"
- Mode d'affichage : standalone (comme une app native)
- Couleur de thème : bleu (#3b82f6)
- Icônes 192x192 et 512x512
- Langue : français

### 2. `/public/icon-192.png` et `/public/icon-512.png`
Icônes SVG avec emoji 🍳 sur fond bleu.
**Note** : Ces fichiers SVG devront être convertis en PNG pour une compatibilité optimale.

### 3. `/public/sw.js`
Service Worker pour :
- Cache des pages principales (/recipes, /planning, /shopping-list)
- Stratégie Network First avec fallback cache
- Support du mode hors ligne

### 4. `/src/components/ServiceWorkerRegistration.tsx`
Composant client qui enregistre le service worker au chargement de la page.

### 5. `/src/app/layout.tsx` (modifié)
Ajout de :
- Référence au manifest
- Meta tags pour PWA (viewport, theme-color)
- Meta tags Apple (apple-touch-icon, etc.)
- Langue française (lang="fr")
- Composant ServiceWorkerRegistration

## Comment installer la PWA ?

### Sur Chrome (Desktop)
1. Visitez l'application dans Chrome
2. Cliquez sur l'icône ⊕ dans la barre d'adresse
3. Cliquez sur "Installer"

### Sur Chrome (Android)
1. Visitez l'application dans Chrome
2. Appuyez sur le menu (⋮)
3. Sélectionnez "Ajouter à l'écran d'accueil"

### Sur Safari (iOS)
1. Visitez l'application dans Safari
2. Appuyez sur le bouton Partager (□↑)
3. Sélectionnez "Sur l'écran d'accueil"
4. Confirmez l'ajout

## Tester en production

Pour que la PWA fonctionne correctement, elle doit être servie en HTTPS.
En développement, `localhost` est accepté.

## Fonctionnalités PWA activées

✅ Installation sur l'écran d'accueil
✅ Mode standalone (sans barre d'adresse)
✅ Icône personnalisée
✅ Service Worker pour cache offline
✅ Splash screen automatique (généré par le navigateur)
✅ Meta tags mobile optimisés
✅ Support iOS (apple-web-app)

## Améliorer les icônes

Pour convertir les SVG en PNG avec de meilleures icônes :

1. Utiliser un outil comme https://realfavicongenerator.net/
2. Uploader une icône haute résolution (512x512 minimum)
3. Télécharger les icônes générées
4. Remplacer icon-192.png et icon-512.png

## Vérifier l'installation

1. Ouvrez Chrome DevTools (F12)
2. Allez dans l'onglet "Application"
3. Vérifiez :
   - Manifest : doit afficher les infos correctement
   - Service Workers : doit être enregistré et activé
   - Cache Storage : doit contenir les URLs cachées
