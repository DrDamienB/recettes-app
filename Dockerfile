# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
VOLUME ["/data"]
ENV DATABASE_URL="file:/data/recettes.sqlite"
ENV PORT=3000
EXPOSE 3000
RUN npm i -g prisma
CMD sh -c "prisma migrate deploy && npm run start"
