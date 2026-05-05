FROM oven/bun:1.3.13 AS deps
WORKDIR /app
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/
RUN bun install

FROM oven/bun:1.3.13 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/bun.lock /app/turbo.json ./
COPY apps/api/ apps/api/
COPY packages/ packages/
WORKDIR /app/apps/api
RUN bun run build

FROM oven/bun:1.3.13 AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json /app/bun.lock /app/turbo.json ./
COPY --from=builder /app/apps/api/package.json apps/api/package.json
COPY --from=builder /app/apps/api/dist apps/api/dist
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["bun", "run", "start"]
