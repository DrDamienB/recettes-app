# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies only when needed
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm ci

# Generate Prisma Client
COPY prisma ./prisma
ENV DATABASE_URL="file:./dev.sqlite"
RUN npx prisma generate

# Build Next.js application
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ============================================
# Stage 3: Production Runner (optimisé)
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Add security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    apk add --no-cache curl

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy only necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Install only Prisma CLI (minimal)
RUN npm install -g prisma@6.18.0 && \
    npm cache clean --force

# Create data directory and set permissions
RUN mkdir -p /data && \
    chown -R nextjs:nodejs /data

# Copy and setup entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh && \
    chown nextjs:nodejs docker-entrypoint.sh

# Volume pour SQLite
VOLUME ["/data"]

ENV DATABASE_URL="file:/data/recettes.sqlite"

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
ENTRYPOINT ["./docker-entrypoint.sh"]
