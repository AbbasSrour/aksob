FROM oven/bun:1.3.5 AS base
WORKDIR /app

FROM base AS deps

COPY . .

RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/apps/api
RUN bun run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json /app/bun.lock /app/turbo.json ./
COPY --from=builder /app/apps/api/package.json apps/api/package.json
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/apps/api/src apps/api/src
COPY --from=builder /app/packages/shared packages/shared
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["sh", "-c", "bun run db:setup:prod && bun run start"]
