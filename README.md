# 🍳 Application Recettes

Application de gestion de recettes construite avec Next.js 16, optimisée pour un déploiement léger sur NAS Synology.

## ✨ Fonctionnalités

- 📖 Gestion de recettes avec ingrédients et étapes
- 📅 Planification de repas
- 🛒 Génération automatique de listes de courses
- 🔄 Gestion des récurrences de repas
- 💾 Base de données SQLite (légère et portable)
- 🐳 Déploiement Docker optimisé

## 🚀 Démarrage rapide

### Développement local

```bash
# Installer les dépendances
npm install

# Configurer la base de données
cp .env.example .env
npx prisma generate
npx prisma migrate dev

# Optionnel: Seeder la base de données
npm run db:seed

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Production (Docker)

```bash
# Build et démarrage
docker-compose up -d

# L'application sera accessible sur http://localhost:3007
```

## 📚 Documentation

- **[GUIDE-DEBUTANT.md](GUIDE-DEBUTANT.md)** - 🎓 Guide pas à pas pour débutants (installation Portainer + déploiement)
- **[README-DEPLOY.md](README-DEPLOY.md)** - Guide de déploiement sur NAS Synology
- **[UPDATES.md](UPDATES.md)** - Guide de mise à jour et maintenance
- **[.env.example](.env.example)** - Variables d'environnement disponibles

## 🛠️ Stack Technique

- **Framework** : [Next.js 16](https://nextjs.org/)
- **Base de données** : SQLite + [Prisma ORM](https://www.prisma.io/)
- **Validation** : [Zod](https://zod.dev/)
- **Styling** : [Tailwind CSS 4](https://tailwindcss.com/)
- **Déploiement** : Docker (optimisé pour faible consommation)

## 🐳 Caractéristiques Docker

- **Image optimisée** : ~100-150 MB (mode standalone Next.js)
- **Multi-stage build** : Build séparé de l'exécution
- **Sécurité** : Exécution en utilisateur non-root
- **Ressources** : 256-512 MB RAM, 0.25-0.5 CPU core
- **Health check** : Monitoring automatique
- **Logs** : Rotation automatique (max 30MB)

## 🔒 Sécurité

- ✅ Headers HTTP sécurisés (HSTS, X-Frame-Options, CSP, etc.)
- ✅ Exécution en utilisateur non-root
- ✅ Capabilities Linux minimales
- ✅ Support HTTPS via reverse proxy
- ✅ Scan de vulnérabilités automatique (GitHub Actions)

## 🔄 Mises à jour

Plusieurs options disponibles :

```bash
# Mise à jour manuelle
bash scripts/update.sh

# Mise à jour automatique via webhook
# Voir UPDATES.md pour la configuration

# Mise à jour planifiée (cron)
# Voir UPDATES.md pour les exemples
```

Consultez [UPDATES.md](UPDATES.md) pour plus de détails.

## 📦 Scripts disponibles

```bash
npm run dev           # Serveur de développement
npm run build         # Build de production
npm run start         # Serveur de production
npm run lint          # Linter ESLint
npm run db:seed       # Seeder la base de données
```

## 🏗️ Structure du projet

```
recettes-app/
├── prisma/              # Schéma et migrations Prisma
│   └── schema.prisma
├── src/
│   ├── app/            # Routes Next.js (App Router)
│   │   ├── api/        # API routes
│   │   └── ...
│   └── lib/            # Utilitaires et helpers
├── scripts/            # Scripts de déploiement et MAJ
├── .github/            # GitHub Actions (CI/CD)
├── docker-compose.yml  # Configuration Docker
├── Dockerfile          # Image Docker optimisée
└── README-DEPLOY.md    # Guide de déploiement
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 🆘 Support

- Consultez [UPDATES.md](UPDATES.md) pour le dépannage
- Vérifiez les logs : `docker logs recettes-app`
- Ouvrez une issue sur GitHub

---

**Optimisé pour** : NAS Synology, Raspberry Pi, serveurs domestiques à faible consommation
