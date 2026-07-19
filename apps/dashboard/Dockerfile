# ---- Base ----
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# ---- Prune the monorepo to the dashboard and its workspace dependencies ----
FROM base AS pruner
COPY . .
RUN pnpm dlx turbo prune dashboard --docker

# ---- Install and build ----
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

ARG NEXT_PUBLIC_WEB_URL
RUN test -n "$NEXT_PUBLIC_WEB_URL"
ENV NEXT_PUBLIC_WEB_URL="$NEXT_PUBLIC_WEB_URL"
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm turbo run build --filter=dashboard

# ---- Production runner ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3002

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=installer --chown=nextjs:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/dashboard/public ./apps/dashboard/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/dashboard/start-dashboard.sh ./apps/dashboard/start-dashboard.sh
RUN chmod 755 ./apps/dashboard/start-dashboard.sh

USER nextjs

EXPOSE 3002

ENTRYPOINT ["./apps/dashboard/start-dashboard.sh"]
CMD ["node", "apps/dashboard/server.js"]
