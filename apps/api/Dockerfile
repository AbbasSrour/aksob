FROM oven/bun:1.3.13 AS builder
WORKDIR /app
COPY . .
RUN bun install
WORKDIR /app/apps/api
RUN bun run build

FROM oven/bun:1.3.13
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json /app/bun.lock /app/turbo.json ./
COPY --from=builder /app/apps/api/package.json apps/api/package.json
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/packages packages
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["bun", "run", "start"]
