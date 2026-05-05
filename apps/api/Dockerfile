FROM oven/bun:1.3.13 AS builder
WORKDIR /app
COPY . .
RUN bun install

FROM oven/bun:1.3.13
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json /app/bun.lock /app/turbo.json ./
COPY --from=builder /app/apps/api apps/api
COPY --from=builder /app/packages packages
WORKDIR /app/apps/api
EXPOSE 3000
RUN bun run db:migrate
CMD ["bun", "run", "src/index.ts"]
