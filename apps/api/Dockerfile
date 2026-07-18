FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# System dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy application before installing so deployments without uv.lock in the
# build context can still resolve dependencies from pyproject.toml.
COPY . .

# Install dependencies. Prefer the committed lockfile, but do not fail the
# Docker COPY stage when Render builds an older context without uv.lock.
RUN if [ -f uv.lock ]; then \
        uv sync --frozen --no-dev; \
    else \
        uv sync --no-dev; \
    fi

# Make startup script executable
RUN chmod +x /app/init-db.sh

EXPOSE 8000

CMD ["sh", "-c", "./init-db.sh && uv run gunicorn config.wsgi:application --bind 0.0.0.0:8000"]
