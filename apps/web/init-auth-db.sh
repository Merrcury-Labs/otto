#!/bin/sh
# Run Better Auth's schema commands before the Next.js server starts.

set -eu

DB_HOST="${DB_HOST:?DB_HOST must be set}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:?DB_USER must be set}"
DB_PASSWORD="${DB_PASSWORD:?DB_PASSWORD must be set}"
DB_NAME="${DB_NAME:?DB_NAME must be set}"

cd /app/apps/web

echo "Ensuring auth schema exists..."
export PGPASSWORD="$DB_PASSWORD"
psql -X -v ON_ERROR_STOP=1 -w \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -c 'CREATE SCHEMA IF NOT EXISTS auth'
unset PGPASSWORD

echo "Generating Better Auth schema..."
better-auth generate --yes

echo "Applying Better Auth schema..."
better-auth migrate --yes

echo "better-auth schema initialized."
