FROM oven/bun:1.3.13 AS base
WORKDIR /app

FROM base AS deps
COPY . .
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app /app
WORKDIR /app/apps/client
RUN bunx --bun vite build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

#COPY --from=deps /app/node_modules ./node_modules
#COPY --from=builder /app/package.json /app/bun.lock /app/turbo.json ./
#COPY --from=builder /app/apps/client/package.json apps/client/package.json
#COPY --from=builder /app/apps/client/dist apps/client/dist
#COPY --from=builder /app/apps/client/paraglide apps/client/paraglide
#COPY --from=builder /app/packages/sdk packages/sdk
#COPY --from=builder /app/packages/ui packages/ui
COPY --from=builder . .

WORKDIR /app/apps/client
EXPOSE 3000
CMD ["bun", "run", "dist/server/server.js"]
