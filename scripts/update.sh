#!/bin/bash
###############################################################################
# Script de mise à jour automatique pour l'application Recettes
# Usage: ./scripts/update.sh [--force] [--no-backup]
###############################################################################

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="recettes-app"
BACKUP_DIR="/volume1/docker/backups/recettes-app"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Options
FORCE=false
NO_BACKUP=false

# Parser les arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --force)
      FORCE=true
      shift
      ;;
    --no-backup)
      NO_BACKUP=true
      shift
      ;;
    *)
      echo -e "${RED}Option inconnue: $1${NC}"
      exit 1
      ;;
  esac
done

###############################################################################
# Fonctions
###############################################################################

print_step() {
  echo -e "\n${GREEN}==>${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

# Vérifier si le conteneur existe
check_container() {
  if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    print_error "Le conteneur ${CONTAINER_NAME} n'existe pas"
    exit 1
  fi
}

# Sauvegarder la base de données
backup_database() {
  if [ "$NO_BACKUP" = true ]; then
    print_warning "Sauvegarde désactivée (--no-backup)"
    return
  fi

  print_step "Sauvegarde de la base de données"

  # Créer le dossier de backup s'il n'existe pas
  mkdir -p "${BACKUP_DIR}"

  # Copier la base de données
  docker cp "${CONTAINER_NAME}:/data/recettes.sqlite" \
    "${BACKUP_DIR}/recettes_${TIMESTAMP}.sqlite" 2>/dev/null || {
    print_warning "Impossible de sauvegarder la base (peut-être vide)"
  }

  # Garder seulement les 10 dernières sauvegardes
  ls -t "${BACKUP_DIR}"/recettes_*.sqlite 2>/dev/null | tail -n +11 | xargs -r rm

  print_success "Base de données sauvegardée"
}

# Vérifier s'il y a des mises à jour
check_updates() {
  print_step "Vérification des mises à jour disponibles"

  cd "$(dirname "$0")/.."

  # Récupérer les dernières modifications
  git fetch origin main

  # Comparer avec la version locale
  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/main)

  if [ "$LOCAL" = "$REMOTE" ]; then
    if [ "$FORCE" = true ]; then
      print_warning "Aucune mise à jour, mais --force activé"
      return 0
    else
      print_success "Application déjà à jour"
      exit 0
    fi
  fi

  print_success "Mises à jour disponibles"

  # Afficher les changements
  echo ""
  git log --oneline HEAD..origin/main
  echo ""
}

# Mettre à jour le code
update_code() {
  print_step "Récupération du nouveau code"

  cd "$(dirname "$0")/.."
  git pull origin main

  print_success "Code mis à jour"
}

# Reconstruire et redémarrer
rebuild_container() {
  print_step "Reconstruction de l'image Docker"

  cd "$(dirname "$0")/.."

  # Arrêter le conteneur
  docker stop "${CONTAINER_NAME}" || true

  # Reconstruire sans cache pour forcer la mise à jour
  docker-compose build --no-cache

  print_success "Image reconstruite"
}

# Démarrer le nouveau conteneur
start_container() {
  print_step "Démarrage du conteneur"

  cd "$(dirname "$0")/.."
  docker-compose up -d

  # Attendre que le conteneur soit healthy
  print_step "Vérification de l'état du conteneur"

  for i in {1..30}; do
    if docker inspect --format='{{.State.Health.Status}}' "${CONTAINER_NAME}" 2>/dev/null | grep -q "healthy"; then
      print_success "Conteneur démarré et opérationnel"
      return 0
    fi
    echo -n "."
    sleep 2
  done

  print_error "Le conteneur n'est pas devenu healthy après 60 secondes"
  print_warning "Vérifiez les logs: docker logs ${CONTAINER_NAME}"
  exit 1
}

# Nettoyer les anciennes images
cleanup() {
  print_step "Nettoyage des anciennes images"

  docker image prune -f

  print_success "Nettoyage effectué"
}

###############################################################################
# Exécution principale
###############################################################################

echo "╔════════════════════════════════════════════╗"
echo "║  Mise à jour - Application Recettes       ║"
echo "╚════════════════════════════════════════════╝"
echo ""

check_container
backup_database
check_updates
update_code
rebuild_container
start_container
cleanup

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Mise à jour terminée avec succès       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo "L'application est accessible sur: http://localhost:3007"
echo "Logs: docker logs -f ${CONTAINER_NAME}"
echo ""
