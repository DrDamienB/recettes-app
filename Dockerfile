# Build
FROM node:20-alpine AS build
WORKDIR /app

# 1) deps
COPY package*.json ./
RUN npm ci

# 2) prisma client (doit être généré AVANT le build Next)
COPY prisma ./prisma
# URL factice suffisante pour la génération du client
ENV DATABASE_URL="file:./dev.sqlite"
RUN npx prisma generate

# 3) reste du code + build
COPY . .
RUN npm run build

# Runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# copie build & deps
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

# volume pour SQLite (prod)
VOLUME ["/data"]
ENV DATABASE_URL="file:/data/recettes.sqlite"
ENV PORT=3000
EXPOSE 3000

# prisma CLI pour appliquer les migrations au démarrage
RUN npm i -g prisma
CMD sh -c "prisma migrate deploy && npm run start"
