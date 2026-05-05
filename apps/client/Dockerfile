FROM oven/bun:1.3.13 AS builder
WORKDIR /app
COPY . .
RUN bun install

FROM node:22-alpine
ENV NODE_ENV=production
RUN corepack enable && npm install -g bun
WORKDIR /app
COPY --from=builder . .
RUN bun run build --filter=client
WORKDIR /app/apps/client
EXPOSE 3000
CMD ["bun", "run", "preview"]
