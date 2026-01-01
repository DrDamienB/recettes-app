#!/bin/sh
set -e

echo "Starting application..."

# Si la base de données n'existe pas, la créer
if [ ! -f "/data/recettes.sqlite" ]; then
  echo "Database not found, creating..."
  prisma migrate deploy || {
    echo "Migration failed, trying db push..."
    prisma db push --accept-data-loss || echo "Warning: Could not initialize database"
  }
else
  echo "Database found, applying migrations..."
  prisma migrate deploy || echo "Warning: Migration failed"
fi

echo "Starting Next.js server..."
exec node server.js
