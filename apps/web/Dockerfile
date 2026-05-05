FROM oven/bun:1.3.13 AS base
WORKDIR /app

FROM base AS deps
COPY . .
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/apps/web
RUN bun run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json /app/bun.lock /app/turbo.json ./
COPY --from=builder /app/apps/web/package.json apps/web/package.json
COPY --from=builder /app/apps/web/build apps/web/build
COPY --from=builder /app/packages/sdk packages/sdk

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["bun", "run", "start"]
