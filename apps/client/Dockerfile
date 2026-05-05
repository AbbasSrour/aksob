FROM node:22-slim AS builder
WORKDIR /app
COPY . .
RUN corepack enable && npm install -g bun
RUN bun install
RUN bun run build --filter=client

FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable && npm install -g bun
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json /app/bun.lock /app/turbo.json ./
COPY --from=builder /app/apps/client apps/client
COPY --from=builder /app/packages packages
WORKDIR /app/apps/client
EXPOSE 3000
CMD ["bun", "run", ".output/server/index.mjs"]