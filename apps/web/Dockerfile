# ---- Base ----
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# ---- Prune ----
FROM base AS pruner
COPY . .
RUN pnpm dlx turbo prune web --docker

# ---- Installer ----
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm turbo run build --filter=web

# ---- Runner ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output (includes all needed node_modules)
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy auth lib source (needed by @better-auth/cli generate/migrate)
COPY --from=installer --chown=nextjs:nodejs /app/packages/auth ./packages/auth

# Copy init script
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/init-auth-db.sh ./apps/web/init-auth-db.sh
RUN chmod +x ./apps/web/init-auth-db.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "./apps/web/init-auth-db.sh && node apps/web/server.js"]
