#!/bin/sh
# Wait for the configured PostgreSQL database, apply migrations, and then
# replace this process with the container command.

set -eu

DB_HOST="${POSTGRES_HOST:-db}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-otto_lms}"
DB_USER="${POSTGRES_USER:-otto_user}"
DB_PASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD must be set}"
MAX_RETRIES="${POSTGRES_CONNECT_RETRIES:-60}"

case "$MAX_RETRIES" in
  ''|0|*[!0-9]*)
    echo "POSTGRES_CONNECT_RETRIES must be a positive integer." >&2
    exit 1
    ;;
esac

echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
attempt=1
export PGPASSWORD="$DB_PASSWORD"

while ! psql -X -w -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -tAc 'SELECT 1' >/dev/null 2>&1; do
  if [ "$attempt" -ge "$MAX_RETRIES" ]; then
    echo "Could not connect to PostgreSQL after ${MAX_RETRIES} attempts." >&2
    exit 1
  fi
  attempt=$((attempt + 1))
  sleep 2
done

unset PGPASSWORD

echo "Applying Django migrations..."
python manage.py migrate --noinput

echo "Database initialization complete."
exec "$@"
