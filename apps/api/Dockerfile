FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY . .
RUN chmod +x /app/init-db.sh && uv sync --frozen --no-dev

EXPOSE 8000

CMD ["sh", "-c", "./init-db.sh && uv run python manage.py runserver 0.0.0.0:8000"]
