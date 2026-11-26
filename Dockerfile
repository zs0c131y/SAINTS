# syntax=docker/dockerfile:1

# 1. Dependencies (cached until package-lock.json changes)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build the standalone Next.js server
FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time public settings (override with --build-arg if needed)
ARG NEXT_PUBLIC_SITE_URL=https://saints.christuniversity.in
ARG NEXT_PUBLIC_GTM_ID=GTM-WCSXFZ7L
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID
RUN npm run build

# 3. Minimal runtime image, running as a non-root user
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080 HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://127.0.0.1:8080/api/health || exit 1
CMD ["node", "server.js"]
