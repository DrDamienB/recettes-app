#!/bin/bash
###############################################################################
# Webhook Listener pour déploiement automatique
# Ce script écoute les webhooks GitHub et déclenche une mise à jour
#
# Installation:
# 1. Installer webhook: sudo apt-get install webhook  (ou via Docker)
# 2. Créer le fichier de config: /etc/webhook.conf
# 3. Démarrer: webhook -hooks /etc/webhook.conf -verbose
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "╔════════════════════════════════════════════╗"
echo "║  Webhook reçu - Déploiement automatique   ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Projet: $PROJECT_DIR"
echo ""

# Log dans un fichier
LOG_FILE="/var/log/recettes-app-deploy.log"
exec > >(tee -a "$LOG_FILE") 2>&1

# Exécuter le script de mise à jour
cd "$PROJECT_DIR"
bash "$SCRIPT_DIR/update.sh" --force

echo ""
echo "Déploiement terminé: $(date '+%Y-%m-%d %H:%M:%S')"
