import type {
  Extension,
  onLoadDocumentPayload,
  onStoreDocumentPayload,
  onConfigurePayload,
  onDestroyPayload,
} from "@hocuspocus/server";
import * as Y from "yjs";
import pg from "pg";

/**
 * PostgreSQL persistence extension for Hocuspocus.
 *
 * Stores Yjs document updates in a `collab` PostgreSQL schema,
 * completely separate from Django's `public` schema.
 */
export class DatabaseExtension implements Extension {
  private pool: pg.Pool;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ??
      `postgres://${process.env.DB_USER ?? "otto_user"}:${process.env.DB_PASSWORD ?? "otto_password"}@${process.env.DB_HOST ?? "localhost"}:${process.env.DB_PORT ?? "5432"}/${process.env.DB_NAME ?? "otto_lms"}`;

    this.pool = new pg.Pool({ connectionString });
  }

  async onConfigure(_data: onConfigurePayload): Promise<void> {
    await this.ensureSchema();
  }

  async onLoadDocument(data: onLoadDocumentPayload): Promise<void> {
    const { documentName, document } = data;

    try {
      const result = await this.pool.query(
        "SELECT data FROM collab.documents WHERE name = $1",
        [documentName]
      );

      if (result.rows.length > 0 && result.rows[0].data) {
        const buffer: Buffer = result.rows[0].data;
        const update = new Uint8Array(buffer);
        Y.applyUpdate(document, update);
      }
    } catch (error) {
      console.error(
        `[collab] Error loading document ${documentName}:`,
        error
      );
    }
  }

  async onStoreDocument(data: onStoreDocumentPayload): Promise<void> {
    const { documentName, document } = data;
    const update = Y.encodeStateAsUpdate(document);
    const buffer = Buffer.from(update);

    try {
      await this.pool.query(
        `INSERT INTO collab.documents (name, data, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (name)
         DO UPDATE SET data = $2, updated_at = NOW()`,
        [documentName, buffer]
      );

      // Also store the incremental update
      await this.pool.query(
        `INSERT INTO collab.updates (document_name, data)
         VALUES ($1, $2)`,
        [documentName, buffer]
      );
    } catch (error) {
      console.error(
        `[collab] Error storing document ${documentName}:`,
        error
      );
    }
  }

  async onDestroy(_data: onDestroyPayload): Promise<void> {
    await this.pool.end();
  }

  private async ensureSchema(): Promise<void> {
    await this.pool.query("CREATE SCHEMA IF NOT EXISTS collab");
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS collab.documents (
        name VARCHAR(255) PRIMARY KEY,
        data BYTEA,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS collab.updates (
        id SERIAL PRIMARY KEY,
        document_name VARCHAR(255) REFERENCES collab.documents(name) ON DELETE CASCADE,
        data BYTEA NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("[collab] Database schema ensured");
  }
}
