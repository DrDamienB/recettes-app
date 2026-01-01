# Guide de Déploiement - Application Recettes

Ce guide vous accompagne pour déployer votre application de recettes sur un NAS Synology via Portainer avec un accès sécurisé depuis l'extérieur.

> 📖 **Pour les mises à jour** : Consultez le guide [UPDATES.md](UPDATES.md) pour apprendre à mettre à jour votre application.

## 📋 Prérequis

- NAS Synology avec Docker installé
- Portainer configuré sur votre NAS
- (Optionnel) Un nom de domaine ou DynDNS configuré
- (Optionnel) Reverse proxy (Nginx Proxy Manager, Traefik, ou le reverse proxy intégré Synology)

## 🚀 Déploiement sur Synology via Portainer

### Option 1 : Déploiement depuis le code local

1. **Transférer les fichiers sur votre NAS**
   - Uploadez tout le projet dans un dossier sur votre NAS (ex: `/volume1/docker/recettes-app/`)

2. **Dans Portainer**
   - Allez dans **Stacks** > **Add stack**
   - Nom: `recettes-app`
   - **Build method**: Repository ou Upload
   - Copiez le contenu du fichier `docker-compose.yml`

3. **Déployer**
   - Cliquez sur **Deploy the stack**
   - Attendez la construction de l'image (peut prendre 2-5 minutes)

### Option 2 : Déploiement depuis GitHub (recommandé)

1. **Pushez votre code sur GitHub** (si ce n'est pas déjà fait)

2. **Dans Portainer**
   - Allez dans **Stacks** > **Add stack**
   - Nom: `recettes-app`
   - **Build method**: Git Repository
   - Repository URL: `https://github.com/votre-username/recettes-app`
   - Repository reference: `refs/heads/main`

3. **Déployer**
   - Cliquez sur **Deploy the stack**

## 🔧 Configuration

### Ajuster les ressources

Dans `docker-compose.yml`, modifiez selon les capacités de votre NAS :

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'      # Pour NAS plus puissant: '1.0' ou '2.0'
      memory: 512M     # Pour plus de marge: 1G
    reservations:
      cpus: '0.25'
      memory: 256M
```

### Changer le port

Si le port 3007 est déjà utilisé, modifiez dans `docker-compose.yml` :

```yaml
ports:
  - "3008:3000"  # Changez 3008 par un port libre
```

## 🌐 Accès depuis l'extérieur

### Configuration du Reverse Proxy

#### Option A : Nginx Proxy Manager (Recommandé)

1. **Installer Nginx Proxy Manager** sur votre NAS via Portainer

2. **Créer un Proxy Host**
   - Domain: `recettes.votre-domaine.com`
   - Scheme: `http`
   - Forward Hostname / IP: `recettes-app` (nom du container)
   - Forward Port: `3000`
   - ✅ Cache Assets
   - ✅ Block Common Exploits
   - ✅ Websockets Support

3. **SSL/TLS**
   - Onglet **SSL**
   - Sélectionnez **Request a new SSL Certificate** (Let's Encrypt)
   - ✅ Force SSL
   - ✅ HTTP/2 Support
   - ✅ HSTS Enabled

#### Option B : Reverse Proxy Synology

1. **Ouvrir le Panneau de configuration** > **Portail d'application**

2. **Reverse Proxy** > **Créer**
   - Nom: Recettes App
   - Protocole source: HTTPS
   - Nom d'hôte source: `recettes.votre-domaine.com`
   - Port source: `443`
   - Protocole destination: HTTP
   - Nom d'hôte destination: `localhost`
   - Port destination: `3007`

3. **En-têtes personnalisés**
   ```
   X-Forwarded-Proto: https
   X-Forwarded-Host: $host
   X-Forwarded-For: $proxy_add_x_forwarded_for
   ```

### Configurer votre routeur

1. **Redirection de ports**
   - Port externe: `443` (HTTPS)
   - Port interne: `443` (vers votre NAS)
   - Protocole: TCP

2. **DynDNS** (si IP dynamique)
   - Utilisez un service comme DuckDNS, No-IP, ou Synology DDNS
   - Configurez dans **Panneau de configuration** > **Accès externe** > **DDNS**

## 🔒 Sécurité

### En-têtes de sécurité

L'application inclut déjà des en-têtes de sécurité dans [next.config.ts](next.config.ts:7-44) :
- Strict-Transport-Security (HSTS)
- X-Frame-Options (protection clickjacking)
- X-Content-Type-Options (protection MIME sniffing)
- Content Security Policy
- Et plus...

### Recommandations supplémentaires

1. **Pare-feu**
   - N'exposez QUE le port 443 (HTTPS)
   - Bloquez tous les autres ports

2. **Fail2Ban** (optionnel mais recommandé)
   - Installez Fail2Ban sur votre NAS pour bloquer les tentatives de brute-force

3. **Mises à jour régulières**
   ```bash
   # Sur votre NAS, mettez à jour l'image régulièrement
   docker-compose pull
   docker-compose up -d
   ```

4. **Sauvegardes**
   - Le volume `recettes_data` contient votre base de données
   - Sauvegardez régulièrement : `/var/lib/docker/volumes/recettes-app_recettes_data/`

## 📊 Surveillance

### Vérifier les logs

Dans Portainer :
- **Containers** > `recettes-app` > **Logs**

Ou en ligne de commande sur le NAS :
```bash
docker logs recettes-app -f
```

### Health Check

L'application expose un endpoint de santé. Vérifiez :
```bash
curl http://localhost:3007
```

### Consommation de ressources

Dans Portainer :
- **Containers** > `recettes-app` > **Stats**

## 🛠 Maintenance

### Redémarrer l'application

```bash
docker restart recettes-app
```

### Reconstruire après modification

```bash
cd /volume1/docker/recettes-app
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Voir la base de données

La base de données SQLite est accessible dans :
```bash
docker exec -it recettes-app sh
cd /data
ls -lh recettes.sqlite
```

### Migrations Prisma

Les migrations s'appliquent automatiquement au démarrage. Pour les forcer manuellement :
```bash
docker exec -it recettes-app sh
prisma migrate deploy
```

## 📈 Optimisations

### Réduire davantage la consommation

1. **Limiter les logs** (déjà configuré à 10MB × 3 fichiers)

2. **Utiliser un réseau Docker dédié** pour isoler l'app

3. **Activer le cache Nginx** pour les assets statiques

### Performance

L'application utilise :
- **Mode standalone Next.js** : image ~100MB (vs ~500MB en mode normal)
- **Multi-stage build** : seuls les fichiers nécessaires en production
- **Non-root user** : sécurité renforcée
- **Healthcheck intégré** : redémarrage automatique si problème

## ❓ Dépannage

### L'application ne démarre pas

1. Vérifiez les logs : `docker logs recettes-app`
2. Vérifiez que le port n'est pas utilisé : `netstat -tulpn | grep 3007`
3. Reconstruisez l'image : `docker-compose up -d --build`

### Erreur de base de données

1. Vérifiez les permissions du volume :
   ```bash
   docker exec -it recettes-app ls -lah /data
   ```

2. Réinitialisez la base (⚠️ perte de données) :
   ```bash
   docker volume rm recettes-app_recettes_data
   docker-compose up -d
   ```

### Impossible d'accéder depuis l'extérieur

1. Vérifiez la redirection de ports du routeur
2. Testez le reverse proxy en local d'abord
3. Vérifiez les logs du reverse proxy
4. Assurez-vous que le certificat SSL est valide

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs de l'application
2. Vérifiez la documentation Next.js : https://nextjs.org/docs
3. Vérifiez la documentation Prisma : https://www.prisma.io/docs

---

**Application optimisée pour :**
- ✅ Faible consommation CPU (0.25-0.5 core)
- ✅ Faible consommation RAM (256-512 MB)
- ✅ Sécurité renforcée (headers, non-root, capabilities limitées)
- ✅ Accès externe sécurisé (HTTPS, reverse proxy)
- ✅ Redémarrage automatique
- ✅ Rotation des logs automatique
