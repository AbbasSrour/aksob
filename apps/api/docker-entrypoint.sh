#!/bin/sh
set -e

echo "Running database migrations and seed..."
bun run db:setup:prod

echo "Starting API server..."
exec "$@"
