-- Otto Collaboration Server — Database Schema
-- Run against the same PostgreSQL database as Django.
-- The `collab` schema is completely separate from Django's `public` schema.

CREATE SCHEMA IF NOT EXISTS collab;

CREATE TABLE IF NOT EXISTS collab.documents (
  name VARCHAR(255) PRIMARY KEY,
  data BYTEA,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collab.updates (
  id SERIAL PRIMARY KEY,
  document_name VARCHAR(255) REFERENCES collab.documents(name) ON DELETE CASCADE,
  data BYTEA NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_updates_document_name
  ON collab.updates (document_name);
