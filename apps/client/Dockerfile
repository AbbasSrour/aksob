FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN corepack enable && npm install -g bun
RUN bun install
RUN bun run build --filter=client

FROM node:22-alpine
ENV NODE_ENV=production
RUN corepack enable && npm install -g bun
RUN bun install
WORKDIR /app
COPY --from=builder . .
WORKDIR /app/apps/client
EXPOSE 3000
CMD ["bun", "run", "preview"]
