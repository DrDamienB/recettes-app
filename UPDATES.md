# Guide de Mise à Jour - Application Recettes

Ce guide présente les différentes méthodes pour mettre à jour votre application.

## 🎯 Stratégies de Mise à Jour

### Option 1 : Mise à Jour Manuelle (Simple)

**Avantages** : Contrôle total, aucune configuration nécessaire
**Inconvénients** : Nécessite une action manuelle

#### Sur Synology NAS (Linux/Bash)

```bash
# Se connecter en SSH sur votre NAS
ssh admin@votre-nas.local

# Aller dans le dossier du projet
cd /volume1/docker/recettes-app

# Exécuter le script de mise à jour
bash scripts/update.sh
```

**Options disponibles** :
```bash
# Mise à jour sans sauvegarde (plus rapide)
bash scripts/update.sh --no-backup

# Forcer la reconstruction même sans changement
bash scripts/update.sh --force
```

#### Sur Windows (PowerShell)

```powershell
# Ouvrir PowerShell en tant qu'administrateur
cd C:\Docker\recettes-app

# Exécuter le script de mise à jour
.\scripts\update.ps1
```

**Options disponibles** :
```powershell
# Mise à jour sans sauvegarde
.\scripts\update.ps1 -NoBackup

# Forcer la reconstruction
.\scripts\update.ps1 -Force
```

#### Via Portainer (Interface graphique)

1. **Ouvrir Portainer** dans votre navigateur
2. Aller dans **Stacks** > **recettes-app**
3. Cliquer sur **Editor**
4. Cliquer sur **Pull and redeploy** ou **Update the stack**
5. Confirmer l'action

---

### Option 2 : Mise à Jour avec Webhook (Automatique)

**Avantages** : Déploiement automatique à chaque push sur GitHub
**Inconvénients** : Configuration initiale requise

#### Installation du Webhook Listener

##### Méthode A : Avec Docker (Recommandé)

Ajoutez ce service à votre `docker-compose.yml` :

```yaml
services:
  # ... votre service recettes-app existant ...

  webhook:
    image: almir/webhook
    container_name: recettes-webhook
    ports:
      - "9000:9000"
    volumes:
      - /volume1/docker/recettes-app/scripts:/scripts:ro
      - /var/run/docker.sock:/var/run/docker.sock
    command: -verbose -hooks=/scripts/webhook.json -hotreload
    restart: unless-stopped
```

##### Méthode B : Installation native

```bash
# Sur Debian/Ubuntu
sudo apt-get update
sudo apt-get install webhook

# Démarrer le webhook listener
webhook -hooks /volume1/docker/recettes-app/scripts/webhook.json -verbose -port 9000
```

#### Configuration GitHub

1. **Générer un secret** pour sécuriser le webhook :
   ```bash
   openssl rand -hex 32
   ```

2. **Modifier `scripts/webhook.json`** :
   - Remplacez `VOTRE_SECRET_WEBHOOK_ICI` par le secret généré
   - Adaptez les chemins si nécessaire

3. **Configurer GitHub** :
   - Allez dans votre repo GitHub > **Settings** > **Webhooks** > **Add webhook**
   - **Payload URL** : `http://votre-nas-ip:9000/hooks/recettes-app-deploy`
   - **Content type** : `application/json`
   - **Secret** : Le secret généré à l'étape 1
   - **Events** : Sélectionnez "Just the push event"
   - Cliquez sur **Add webhook**

4. **Ouvrir le port sur votre routeur** (si accès externe souhaité) :
   - Port : `9000`
   - Destination : Votre NAS
   - Protocole : TCP

**Note de sécurité** : Si vous exposez le webhook sur Internet, utilisez un reverse proxy avec HTTPS.

---

### Option 3 : Mise à Jour Planifiée (Cron)

**Avantages** : Mises à jour automatiques régulières
**Inconvénients** : Peut mettre à jour à des moments inopportuns

#### Configuration d'un Cron Job

```bash
# Éditer la crontab
crontab -e

# Ajouter cette ligne pour mettre à jour tous les jours à 3h du matin
0 3 * * * cd /volume1/docker/recettes-app && bash scripts/update.sh --no-backup >> /var/log/recettes-update.log 2>&1

# Ou tous les dimanches à 2h
0 2 * * 0 cd /volume1/docker/recettes-app && bash scripts/update.sh >> /var/log/recettes-update.log 2>&1
```

#### Via Synology DSM

1. **Ouvrir le Panneau de configuration** > **Planificateur de tâches**
2. **Créer** > **Tâche planifiée** > **Script défini par l'utilisateur**
3. Configuration :
   - **Nom** : Mise à jour Recettes App
   - **Utilisateur** : root
   - **Planification** : Tous les dimanches à 03:00
   - **Script** :
     ```bash
     cd /volume1/docker/recettes-app
     bash scripts/update.sh --no-backup
     ```

---

## 🔄 Stratégie de Rollback (Retour en Arrière)

Si une mise à jour pose problème, vous pouvez revenir à la version précédente.

### Restaurer la Base de Données

```bash
# Lister les sauvegardes disponibles
ls -lh /volume1/docker/backups/recettes-app/

# Restaurer une sauvegarde spécifique
docker cp /volume1/docker/backups/recettes-app/recettes_20260115_030000.sqlite \
  recettes-app:/data/recettes.sqlite

# Redémarrer le conteneur
docker restart recettes-app
```

### Revenir au Code Précédent

```bash
cd /volume1/docker/recettes-app

# Voir l'historique des commits
git log --oneline -10

# Revenir à un commit spécifique
git reset --hard <commit-id>

# Reconstruire
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Vérification après Mise à Jour

### Vérifier que l'application fonctionne

```bash
# Vérifier le statut du conteneur
docker ps | grep recettes-app

# Vérifier les logs
docker logs recettes-app --tail 50

# Tester l'endpoint de santé
curl http://localhost:3007/api/health

# Vérifier le health check
docker inspect --format='{{.State.Health.Status}}' recettes-app
```

### Vérifier la version déployée

```bash
# Voir le dernier commit déployé
cd /volume1/docker/recettes-app
git log -1 --oneline
```

### Vérifier la taille de l'image

```bash
docker images | grep recettes-app
```

---

## 🔔 Notifications (Optionnel)

### Recevoir des notifications par email

Installez `mailutils` et modifiez le script `update.sh` :

```bash
# À la fin du script update.sh, ajoutez :
echo "Mise à jour terminée avec succès" | mail -s "Recettes App - Déploiement OK" votre-email@example.com
```

### Notifications via Webhook (Discord, Slack, etc.)

Ajoutez à la fin de `update.sh` :

```bash
# Pour Discord
curl -H "Content-Type: application/json" \
  -d '{"content":"✅ Recettes App mise à jour avec succès"}' \
  "VOTRE_WEBHOOK_DISCORD_URL"

# Pour Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"✅ Recettes App mise à jour avec succès"}' \
  "VOTRE_WEBHOOK_SLACK_URL"
```

---

## 🛡️ Bonnes Pratiques

### 1. **Testez avant de déployer**

GitHub Actions teste automatiquement chaque push :
- ✅ Build Docker réussit
- ✅ Conteneur démarre correctement
- ✅ Scan de sécurité OK

Consultez les résultats dans l'onglet **Actions** de votre repo GitHub.

### 2. **Sauvegardez régulièrement**

```bash
# Script de sauvegarde manuelle
docker cp recettes-app:/data/recettes.sqlite \
  /volume1/docker/backups/recettes-app/recettes_manual_$(date +%Y%m%d_%H%M%S).sqlite
```

### 3. **Surveillez les logs**

```bash
# Suivre les logs en temps réel
docker logs -f recettes-app

# Logs des 100 dernières lignes
docker logs recettes-app --tail 100

# Logs avec timestamp
docker logs recettes-app -t
```

### 4. **Utilisez les tags Git**

```bash
# Taguer une version stable
git tag -a v1.0.0 -m "Version 1.0.0 - Production stable"
git push origin v1.0.0

# Déployer une version spécifique
git checkout v1.0.0
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔍 Dépannage

### La mise à jour échoue

```bash
# Vérifier l'espace disque
df -h

# Nettoyer les images inutilisées
docker system prune -a --volumes

# Vérifier les permissions
ls -la /volume1/docker/recettes-app
```

### Le conteneur ne démarre pas après mise à jour

```bash
# Vérifier les logs détaillés
docker logs recettes-app --tail 200

# Vérifier la configuration
docker inspect recettes-app

# Revenir à la version précédente
git reset --hard HEAD^
docker-compose up -d --build
```

### Les migrations Prisma échouent

```bash
# Se connecter au conteneur
docker exec -it recettes-app sh

# Vérifier l'état des migrations
prisma migrate status

# Réinitialiser (⚠️ perte de données)
prisma migrate reset --force
```

---

## 📈 Monitoring des Mises à Jour

### Watchtower (Mise à jour automatique des images)

Ajoutez Watchtower à votre `docker-compose.yml` pour mettre à jour automatiquement les images Docker :

```yaml
services:
  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=86400  # Vérifier toutes les 24h
      - WATCHTOWER_INCLUDE_STOPPED=true
    restart: unless-stopped
```

**Note** : Watchtower met à jour l'image de base Node.js, pas votre code applicatif.

---

## 📝 Changelog

Pour suivre les changements entre les versions, consultez :
- **GitHub** : Onglet "Releases" de votre repository
- **Commits** : `git log --oneline`
- **Actions** : Résultats des builds CI/CD

---

**Besoin d'aide ?** Consultez les logs avec `docker logs recettes-app` ou ouvrez une issue sur GitHub.
