#!/bin/sh
# init-db.sh — Creates the PostgreSQL user and database if they don't exist,
# then runs Django migrations before starting the server.
# Requires psql to be available (provided by postgresql-client).

set -e

DB_HOST="${POSTGRES_HOST:-host.docker.internal}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-otto_lms}"
DB_USER="${POSTGRES_USER:-otto_user}"
DB_PASSWORD="${POSTGRES_PASSWORD:-otto_password}"
ADMIN_USER="${POSTGRES_ADMIN_USER:-postgres}"
ADMIN_PASSWORD="${POSTGRES_ADMIN_PASSWORD:-}"

echo "Checking PostgreSQL connectivity at ${DB_HOST}:${DB_PORT}..."

# Wait for Postgres to be ready
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$ADMIN_USER" -q 2>/dev/null; do
  echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
  sleep 2
done

echo "PostgreSQL is reachable. Creating user/database if needed..."

# Build PGPASSWORD for the admin user (used for creation commands)
export PGPASSWORD="$ADMIN_PASSWORD"

# Create the user if it doesn't exist
USER_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$ADMIN_USER" -d postgres -tAc \
  "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")

if [ "$USER_EXISTS" != "1" ]; then
  echo "Creating user '$DB_USER'..."
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$ADMIN_USER" -d postgres -c \
    "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
  echo "User '$DB_USER' created."
else
  echo "User '$DB_USER' already exists."
fi

# Create the database if it doesn't exist
DB_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$ADMIN_USER" -d postgres -tAc \
  "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" != "1" ]; then
  echo "Creating database '$DB_NAME' owned by '$DB_USER'..."
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$ADMIN_USER" -d postgres -c \
    "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
  echo "Database '$DB_NAME' created."
else
  echo "Database '$DB_NAME' already exists."
fi

unset PGPASSWORD

echo "Running Django migrations..."
python manage.py migrate

echo "Database initialization complete."
