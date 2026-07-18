#!/bin/sh
# init-auth-db.sh — Runs better-auth migrations to set up the auth schema/tables.
# Runs before the Next.js server starts.

set -e

echo "Generating better-auth migration..."
cd /app/apps/web
pnpm dlx @better-auth/cli generate

echo "Running better-auth migration..."
pnpm dlx @better-auth/cli migrate

echo "better-auth schema initialized."
