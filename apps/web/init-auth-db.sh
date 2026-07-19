#!/bin/sh
# Run Better Auth's schema commands before the Next.js server starts.

set -e

cd /app/apps/web

echo "Generating Better Auth schema..."
better-auth generate

echo "Applying Better Auth schema..."
better-auth migrate

echo "better-auth schema initialized."
