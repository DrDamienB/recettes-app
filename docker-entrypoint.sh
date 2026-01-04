#!/bin/sh
set -e

echo "Starting application..."

# Flag pour savoir si c'est une nouvelle DB
NEW_DB=false

# Si la base de données n'existe pas, la créer
if [ ! -f "/data/recettes.sqlite" ]; then
  echo "Database not found, creating..."
  NEW_DB=true
  prisma migrate deploy || {
    echo "Migration failed, trying db push..."
    prisma db push --accept-data-loss || echo "Warning: Could not initialize database"
  }
else
  echo "Database found, applying migrations..."
  prisma migrate deploy || echo "Warning: Migration failed"
fi

# Si c'est une nouvelle base de données, exécuter le seed
if [ "$NEW_DB" = true ]; then
  echo "New database detected, running seed..."
  node prisma/seed.js || echo "Warning: Seed failed"
fi

echo "Starting Next.js server..."
exec node server.js
