# 🎓 Guide Débutant - Déployer l'Application Recettes sur Synology

**Pour qui ?** Ce guide est fait pour vous si vous n'avez jamais utilisé Docker, Portainer, ou déployé une application.

**Durée estimée :** 30-45 minutes (première installation)

**Ce dont vous avez besoin :**
- Un NAS Synology (n'importe quel modèle récent)
- Un accès administrateur à votre NAS
- Une connexion Internet

---

## 📚 Table des matières

1. [Préparer votre NAS Synology](#étape-1--préparer-votre-nas-synology)
2. [Installer Docker](#étape-2--installer-docker)
3. [Installer Portainer](#étape-3--installer-portainer)
4. [Déployer l'application](#étape-4--déployer-lapplication)
5. [Accéder à l'application](#étape-5--accéder-à-lapplication)
6. [Premiers pas](#étape-6--premiers-pas)

---

## Étape 1 : Préparer votre NAS Synology

### 1.1 Se connecter à DSM

1. **Ouvrez votre navigateur** (Chrome, Firefox, Edge, Safari)
2. **Tapez l'adresse de votre NAS** :
   - Soit l'IP locale : `http://192.168.1.X` (remplacez X par l'IP de votre NAS)
   - Soit le nom : `http://synology.local` ou `http://diskstation`
3. **Connectez-vous** avec votre compte administrateur

💡 **Astuce** : Si vous ne connaissez pas l'IP de votre NAS :
   - Téléchargez [Synology Assistant](https://www.synology.com/fr-fr/support/download)
   - Lancez-le, il trouvera automatiquement votre NAS

### 1.2 Activer SSH (optionnel mais recommandé)

1. **Dans DSM**, cliquez sur **Panneau de configuration**
2. Allez dans **Terminal & SNMP**
3. Cochez **Activer le service SSH**
4. Port : laissez `22` (par défaut)
5. Cliquez sur **Appliquer**

---

## Étape 2 : Installer Docker

### 2.1 Ouvrir le Centre de paquets

1. Dans DSM, cliquez sur l'icône en forme de **grille** (coin supérieur gauche)
2. Cherchez et cliquez sur **Centre de paquets**

### 2.2 Installer Docker

1. Dans la barre de recherche, tapez : `Docker`
2. Cliquez sur **Docker** dans les résultats
3. Cliquez sur **Installer**
4. Attendez la fin de l'installation (1-3 minutes)
5. Une fois installé, cliquez sur **Ouvrir**

Vous devriez voir l'interface Docker avec plusieurs onglets :
- Aperçu
- Registre
- Image
- Conteneur
- etc.

### 2.3 Créer un dossier pour Docker (recommandé)

1. Ouvrez **File Station** (dans le menu principal)
2. Allez dans **docker** (créez-le si nécessaire : clic droit > Nouveau dossier > "docker")
3. Dans le dossier `docker`, créez un sous-dossier : **recettes-app**

Vous avez maintenant : `/volume1/docker/recettes-app/`

---

## Étape 3 : Installer Portainer

**Pourquoi Portainer ?** C'est une interface graphique qui rend Docker beaucoup plus facile à utiliser.

### 3.1 Méthode facile : Via l'interface Docker

1. **Ouvrez Docker** (depuis le menu principal de DSM)
2. Allez dans l'onglet **Registre**
3. Dans la recherche, tapez : `portainer/portainer-ce`
4. Double-cliquez sur `portainer/portainer-ce` pour le télécharger
5. Sélectionnez le tag `latest` et cliquez sur **Sélectionner**
6. Attendez le téléchargement (quelques minutes)

### 3.2 Lancer Portainer

1. Allez dans l'onglet **Image**
2. Trouvez `portainer/portainer-ce:latest`
3. Sélectionnez-la, puis cliquez sur **Lancer**

**Configuration du conteneur :**

#### Paramètres généraux :
- **Nom du conteneur** : `portainer`

#### Paramètres avancés > Paramètres de port :
Cliquez sur **Ajouter** et configurez :
- **Port local** : `9000`
- **Port du conteneur** : `9000`
- **Type** : `TCP`

Cliquez à nouveau sur **Ajouter** :
- **Port local** : `9443`
- **Port du conteneur** : `9443`
- **Type** : `TCP`

#### Paramètres avancés > Volume :
Cliquez sur **Ajouter un dossier** :
- **Fichier/Dossier** : Sélectionnez `/var/run/docker.sock`
- **Point de montage** : `/var/run/docker.sock`

Cliquez à nouveau sur **Ajouter un dossier** :
- **Fichier/Dossier** : Créez `/volume1/docker/portainer_data`
- **Point de montage** : `/data`

#### Finaliser :
- Cochez **Activer le redémarrage automatique**
- Cliquez sur **Appliquer**

### 3.3 Première connexion à Portainer

1. **Ouvrez un nouvel onglet** dans votre navigateur
2. Allez sur : `http://IP-DE-VOTRE-NAS:9000`
   - Exemple : `http://192.168.1.50:9000`

3. **Première configuration** :
   - **Username** : `admin` (vous pouvez choisir un autre nom)
   - **Password** : Choisissez un mot de passe fort (minimum 12 caractères)
   - Confirmez le mot de passe
   - Cliquez sur **Create user**

4. **Sélectionnez votre environnement** :
   - Cliquez sur **Get Started**
   - Vous verrez votre environnement Docker local
   - Cliquez sur **local**

🎉 **Bravo !** Portainer est installé et configuré.

---

## Étape 4 : Déployer l'Application

### 4.1 Préparer les fichiers

**Option A : Via GitHub (recommandé si vous avez Git)**

1. Poussez votre code sur GitHub (si ce n'est pas déjà fait)
2. Notez l'URL de votre repository : `https://github.com/VOTRE-USERNAME/recettes-app`

**Option B : Upload manuel (pour débutants)**

1. **Sur votre PC**, localisez le dossier de votre projet `recettes-app`
2. **Ouvrez File Station** sur votre NAS
3. Allez dans `/volume1/docker/`
4. **Uploadez** tout le dossier `recettes-app`
   - Vous pouvez faire glisser-déposer le dossier
   - Ou utiliser le bouton **Charger** > **Charger - Ignorer**

Vous devriez maintenant avoir : `/volume1/docker/recettes-app/` avec tous les fichiers dedans.

### 4.2 Créer la stack dans Portainer

1. **Retournez dans Portainer** (`http://IP-NAS:9000`)
2. Cliquez sur **local** (votre environnement Docker)
3. Dans le menu de gauche, cliquez sur **Stacks**
4. Cliquez sur **+ Add stack** (bouton bleu en haut)

### 4.3 Configuration de la stack

**Nom de la stack :**
```
recettes-app
```

**Méthode de build :**

#### Si vous utilisez GitHub (Option A) :
1. Sélectionnez l'onglet **Repository**
2. Remplissez :
   - **Repository URL** : `https://github.com/VOTRE-USERNAME/recettes-app`
   - **Repository reference** : `refs/heads/main`
   - **Compose path** : `docker-compose.yml`

#### Si vous avez uploadé manuellement (Option B) :
1. Sélectionnez l'onglet **Web editor**
2. **Copiez-collez** le contenu suivant :

```yaml
version: "3.9"

services:
  recettes-app:
    container_name: recettes-app
    build:
      context: /volume1/docker/recettes-app
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/data/recettes.sqlite
      - PORT=3000
      - NEXT_TELEMETRY_DISABLED=1
    ports:
      - "3007:3000"
    volumes:
      - recettes_data:/data
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETUID
      - SETGID
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  recettes_data:
    driver: local
```

### 4.4 Déployer

1. Cochez **Enable access control** (si proposé)
2. Cliquez sur **Deploy the stack**

**Attendez patiemment** (2-5 minutes) :
- Portainer va construire l'image Docker
- Compiler votre application Next.js
- Créer la base de données
- Démarrer le conteneur

Vous verrez les logs défiler. C'est normal !

### 4.5 Vérifier le déploiement

1. Dans Portainer, allez dans **Containers** (menu de gauche)
2. Vous devriez voir `recettes-app` avec un **statut vert** (running)
3. Cliquez sur le nom `recettes-app`
4. Cliquez sur **Logs** pour voir les logs
5. Vous devriez voir quelque chose comme :
   ```
   ✓ Ready in 2.1s
   - Local:        http://localhost:3000
   ```

🎉 **L'application est déployée !**

---

## Étape 5 : Accéder à l'Application

### 5.1 Accès local (dans votre réseau)

1. **Ouvrez votre navigateur**
2. Allez sur : `http://IP-DE-VOTRE-NAS:3007`
   - Exemple : `http://192.168.1.50:3007`

Vous devriez voir votre application de recettes ! 🎉

### 5.2 Vérifier que tout fonctionne

Testez l'endpoint de santé :
```
http://IP-DE-VOTRE-NAS:3007/api/health
```

Vous devriez voir :
```json
{
  "status": "ok",
  "timestamp": "2026-01-01T...",
  "database": "connected"
}
```

---

## Étape 6 : Premiers Pas

### 6.1 Initialiser la base de données (si nécessaire)

Si votre application affiche une erreur de base de données :

1. **Ouvrez Portainer** > **Containers** > `recettes-app`
2. Cliquez sur **Console**
3. Sélectionnez **Command** : `/bin/sh`
4. Cliquez sur **Connect**
5. Dans le terminal, tapez :
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
6. Fermez la console

### 6.2 Explorer l'application

Retournez sur `http://IP-NAS:3007` et explorez :
- La liste des recettes
- Créer une nouvelle recette
- Planifier des repas
- Générer une liste de courses

---

## 🔧 Personnalisation

### Changer le port

Si le port 3007 est déjà utilisé :

1. **Portainer** > **Stacks** > `recettes-app`
2. Cliquez sur **Editor**
3. Trouvez la ligne :
   ```yaml
   ports:
     - "3007:3000"
   ```
4. Changez `3007` par un autre port (ex: `3008`, `8080`, etc.)
5. Cliquez sur **Update the stack**
6. Attendez le redémarrage

### Ajuster les ressources

Si votre NAS est puissant, augmentez les limites :

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'      # Au lieu de 0.5
      memory: 1G       # Au lieu de 512M
```

---

## 🌐 Accès depuis l'extérieur (Optionnel)

**⚠️ Pour utilisateurs avancés**

Si vous voulez accéder à votre application depuis Internet, consultez la section "Accès depuis l'extérieur" du [README-DEPLOY.md](README-DEPLOY.md#-accès-depuis-lextérieur).

**Ce qu'il vous faut :**
- Un nom de domaine (ou DynDNS gratuit)
- Un reverse proxy (Nginx Proxy Manager recommandé)
- Ouvrir le port 443 sur votre routeur

---

## 🆘 Problèmes Courants

### L'application ne démarre pas

**Vérifiez les logs :**
1. Portainer > Containers > recettes-app > Logs
2. Cherchez les erreurs en rouge

**Solutions courantes :**
- Attendez 1-2 minutes (le premier démarrage est plus long)
- Vérifiez que le port 3007 n'est pas déjà utilisé
- Redémarrez le conteneur : Portainer > Containers > recettes-app > Restart

### "Port already in use"

Le port 3007 est déjà utilisé. Changez-le dans la stack (voir Personnalisation).

### "Cannot connect to database"

1. Ouvrez la console du conteneur (Portainer > Console)
2. Lancez :
   ```bash
   npx prisma migrate deploy
   ```

### L'image est trop grande / build trop long

C'est normal la première fois (5-10 minutes). Les prochains builds seront plus rapides grâce au cache Docker.

### Je ne peux pas accéder à l'application

1. Vérifiez que le conteneur est "running" (vert) dans Portainer
2. Vérifiez l'IP de votre NAS : `http://IP-NAS:3007`
3. Essayez depuis un autre appareil du même réseau
4. Désactivez temporairement le pare-feu de votre PC

---

## 📊 Maintenance

### Voir les logs

Portainer > Containers > recettes-app > Logs

### Redémarrer l'application

Portainer > Containers > recettes-app > Restart

### Arrêter l'application

Portainer > Containers > recettes-app > Stop

### Supprimer l'application

1. Portainer > Stacks > recettes-app
2. Cliquez sur **Delete this stack**
3. Confirmez

**⚠️ Attention :** Vos données (recettes) seront conservées dans le volume `recettes_data`. Pour les supprimer aussi :
- Portainer > Volumes > recettes-app_recettes_data > Remove

---

## 📚 Aller Plus Loin

Une fois l'application installée et fonctionnelle :

1. **Consultez [UPDATES.md](UPDATES.md)** pour apprendre à mettre à jour l'application
2. **Consultez [README-DEPLOY.md](README-DEPLOY.md)** pour la configuration avancée
3. **Explorez Portainer** pour découvrir d'autres fonctionnalités

---

## 🎓 Concepts de Base (Bonus)

### Qu'est-ce que Docker ?

Docker permet d'empaqueter une application avec toutes ses dépendances dans un "conteneur" isolé. C'est comme une mini-machine virtuelle ultra-légère.

**Avantages :**
- Installation en un clic
- Isolation (n'affecte pas le reste du système)
- Facile à mettre à jour ou supprimer

### Qu'est-ce que Portainer ?

Portainer est une interface graphique pour Docker. Au lieu de taper des commandes, vous utilisez une interface web avec des boutons.

### Qu'est-ce qu'une Stack ?

Une "stack" est un ensemble de conteneurs qui fonctionnent ensemble. Ici, notre stack ne contient qu'un seul conteneur (recettes-app), mais elle pourrait en contenir plusieurs (base de données séparée, cache Redis, etc.).

### Volume Docker

Un volume est un espace de stockage persistant. Même si vous supprimez le conteneur, les données dans le volume restent. C'est là que votre base de données SQLite est stockée.

---

## ✅ Checklist Finale

Avant de fermer ce guide, vérifiez que :

- [ ] Docker est installé sur votre NAS
- [ ] Portainer est accessible sur `http://IP-NAS:9000`
- [ ] La stack `recettes-app` est déployée et "running"
- [ ] Vous pouvez accéder à l'application sur `http://IP-NAS:3007`
- [ ] L'endpoint `/api/health` renvoie `"status": "ok"`
- [ ] Vous pouvez créer une recette de test

🎉 **Félicitations !** Vous avez déployé votre première application avec Docker sur votre NAS Synology !

---

**Besoin d'aide ?**
- Consultez les logs : Portainer > Containers > recettes-app > Logs
- Ouvrez une issue sur GitHub avec les logs et une description du problème
- Rejoignez la communauté Synology sur Reddit ou les forums officiels
