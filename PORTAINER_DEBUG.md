# Guide de débogage Portainer

## 1. Vérifier les logs du container

Dans Portainer :
1. Va dans "Containers"
2. Clique sur ton container "recettes-app"
3. Clique sur "Logs"
4. Regarde les dernières lignes pour voir l'erreur

Cherche spécifiquement :
- `Migration failed`
- `Error`
- `ENOENT`
- `prisma`
- `Exit code`

## 2. Forcer un rebuild complet de l'image

### Option A : Via Portainer UI
1. Va dans "Stacks" (si tu uses un stack) ou "Containers"
2. Arrête le container
3. Va dans "Images"
4. Trouve l'image "recettes-app" et supprime-la
5. Redémarre le stack/container (il va rebuilder l'image)

### Option B : Via ligne de commande SSH
Si tu as accès SSH à ton serveur :

```bash
# Se connecter au serveur
ssh user@your-server

# Arrêter le container
docker stop recettes-app

# Supprimer le container
docker rm recettes-app

# Supprimer l'image (force rebuild)
docker rmi recettes-app:latest

# Rebuilder sans cache
docker build -t recettes-app:latest --no-cache .

# Redémarrer
docker compose up -d
# OU
docker run -d --name recettes-app -p 3000:3000 -v recettes-data:/data recettes-app:latest
```

## 3. Vérifier le volume de données

Le problème peut venir de la migration Prisma qui échoue car la base existe déjà.

### Vérifier le contenu du volume :
```bash
# Lister les volumes
docker volume ls

# Inspecter le volume
docker volume inspect recettes-data

# Voir le contenu
docker run --rm -v recettes-data:/data alpine ls -la /data
```

### Si la migration échoue, deux options :

#### Option A : Appliquer la migration manuellement
```bash
# Se connecter au container en cours
docker exec -it recettes-app sh

# Appliquer les migrations
npx prisma migrate deploy

# Vérifier la base
npx prisma studio
```

#### Option B : Reset complet (ATTENTION : perte de données)
```bash
# Arrêter le container
docker stop recettes-app

# Supprimer le volume (perte de toutes les données)
docker volume rm recettes-data

# Redémarrer (va recréer la base avec le seed)
docker start recettes-app
```

## 4. Problèmes courants et solutions

### Erreur : "Migration already applied"
La migration existe déjà. C'est OK, le container devrait démarrer quand même.

### Erreur : "Table Store already exists"
Quelqu'un a créé la table manuellement. Solutions :
1. Supprimer la table : `DROP TABLE Store;`
2. Ou marquer la migration comme appliquée

### Erreur : "bcryptjs not found"
Le Dockerfile devrait installer bcryptjs. Vérifier que la ligne existe :
```dockerfile
RUN npm install bcryptjs@3.0.3
```

### Erreur : "Permission denied /data"
Problème de permissions sur le volume :
```bash
docker exec -it recettes-app sh -c "ls -la /data"
docker exec -it recettes-app sh -c "chown -R nextjs:nodejs /data"
```

## 5. Workflow de redéploiement recommandé

1. **Commit et push** ton code sur Git
2. Sur le serveur avec Portainer :
   ```bash
   # Pull les derniers changements
   git pull origin main

   # Rebuild l'image (sans cache si problème)
   docker build -t recettes-app:latest --no-cache .

   # Redémarrer via Portainer UI ou CLI
   docker compose down && docker compose up -d
   ```

3. **Vérifier les logs** immédiatement après le démarrage

## 6. Stack Portainer recommandé

Si tu utilises un stack dans Portainer, voici la config recommandée :

```yaml
version: '3.8'

services:
  recettes-app:
    build:
      context: .
      dockerfile: Dockerfile
    image: recettes-app:latest
    container_name: recettes-app
    ports:
      - "3000:3000"
    volumes:
      - recettes-data:/data
    environment:
      - DATABASE_URL=file:/data/recettes.sqlite
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  recettes-data:
    driver: local
```

## 7. Checklist de déploiement

- [ ] Code commit et push sur Git
- [ ] Image Docker buildée sans cache
- [ ] Container arrêté proprement
- [ ] Logs vérifiés pour erreurs
- [ ] Migration Prisma appliquée avec succès
- [ ] Seed exécuté (si nouvelle base)
- [ ] Healthcheck qui passe
- [ ] Application accessible sur le port 3000
