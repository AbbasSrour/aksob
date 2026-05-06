FROM node:22-slim AS builder
WORKDIR /app

# Accept build arguments for Vite client-side env vars (required at build time)
ARG VITE_API_URL
ARG VITE_APP_URL
ARG VITE_MAINTENANCE
ARG VITE_APP_TITLE

# Make them available to Vite during build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_MAINTENANCE=$VITE_MAINTENANCE
ENV VITE_APP_TITLE=$VITE_APP_TITLE

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