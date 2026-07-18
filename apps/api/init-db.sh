#!/bin/sh
# Wait for PostgreSQL, provision the application role/database idempotently,
# apply migrations, and then replace this process with the container command.

set -eu

DB_HOST="${POSTGRES_HOST:-db}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-otto_lms}"
DB_USER="${POSTGRES_USER:-otto_user}"
DB_PASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD must be set}"
ADMIN_DB="${POSTGRES_ADMIN_DB:-postgres}"
ADMIN_USER="${POSTGRES_ADMIN_USER:-postgres}"
ADMIN_PASSWORD="${POSTGRES_ADMIN_PASSWORD:?POSTGRES_ADMIN_PASSWORD must be set}"
MAX_RETRIES="${POSTGRES_CONNECT_RETRIES:-60}"

case "$MAX_RETRIES" in
  ''|0|*[!0-9]*)
    echo "POSTGRES_CONNECT_RETRIES must be a positive integer." >&2
    exit 1
    ;;
esac

echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
attempt=1
export PGPASSWORD="$ADMIN_PASSWORD"

while ! psql -X -w -h "$DB_HOST" -p "$DB_PORT" -U "$ADMIN_USER" -d "$ADMIN_DB" \
  -tAc 'SELECT 1' >/dev/null 2>&1; do
  if [ "$attempt" -ge "$MAX_RETRIES" ]; then
    echo "Could not connect to PostgreSQL after ${MAX_RETRIES} attempts." >&2
    exit 1
  fi
  attempt=$((attempt + 1))
  sleep 2
done

echo "PostgreSQL is ready; ensuring application role and database exist..."
psql -X -v ON_ERROR_STOP=1 -w \
  -h "$DB_HOST" -p "$DB_PORT" -U "$ADMIN_USER" -d "$ADMIN_DB" \
  --set=db_name="$DB_NAME" --set=db_user="$DB_USER" \
  --set=admin_user="$ADMIN_USER" \
  --set=db_password="$DB_PASSWORD" <<'SQL'
SELECT pg_advisory_lock(hashtext('otto database bootstrap'));
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'db_user', :'db_password')
WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = :'db_user') \gexec
SELECT format('GRANT %I TO %I', :'db_user', :'admin_user')
WHERE :'db_user' <> :'admin_user'
  AND NOT pg_has_role(:'admin_user', :'db_user', 'MEMBER') \gexec
SELECT format('CREATE DATABASE %I OWNER %I', :'db_name', :'db_user')
WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_database WHERE datname = :'db_name') \gexec
SELECT format('ALTER DATABASE %I OWNER TO %I', :'db_name', :'db_user') \gexec
SELECT pg_advisory_unlock(hashtext('otto database bootstrap'));
SQL

unset PGPASSWORD
# Do not pass privileged database credentials to the long-running web process.
unset POSTGRES_ADMIN_DB POSTGRES_ADMIN_USER POSTGRES_ADMIN_PASSWORD ADMIN_PASSWORD

echo "Applying Django migrations..."
python manage.py migrate --noinput

echo "Database initialization complete."
exec "$@"
