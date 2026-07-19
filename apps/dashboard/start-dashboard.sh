#!/bin/sh
# Validate production configuration, then start the dashboard command.

set -eu

: "${BETTER_AUTH_URL:?BETTER_AUTH_URL must be set}"
: "${BETTER_AUTH_SECRET:?BETTER_AUTH_SECRET must be set}"
: "${DB_HOST:?DB_HOST must be set}"
: "${DB_USER:?DB_USER must be set}"
: "${DB_PASSWORD:?DB_PASSWORD must be set}"
: "${DB_NAME:?DB_NAME must be set}"
: "${BE_URL:?BE_URL must be set}"
: "${NEXT_PUBLIC_WEB_URL:?NEXT_PUBLIC_WEB_URL must be set}"

echo "Starting dashboard on ${HOSTNAME:-0.0.0.0}:${PORT:-3002}..."
exec "$@"
