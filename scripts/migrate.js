/**
 * Führt DB-Migrationen aus (z. B. beim Vercel-Build).
 * Ohne DATABASE_URL wird übersprungen (exit 0), damit lokaler Build ohne DB funktioniert.
 */
import dotenv from "dotenv";
import pkg from "pg";
import { createMigrationRunner } from "../db/migrations.js";
import { parseBoolean } from "../utils/helpers.js";

dotenv.config();
const { Pool } = pkg;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[migrate] DATABASE_URL not set, skipping migrations.");
    process.exit(0);
  }

  const sslEnabled = parseBoolean(process.env.DATABASE_SSL_ENABLED, false);
  const rejectUnauthorized = parseBoolean(
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED,
    true
  );
  const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
  if (sslEnabled) {
    poolConfig.ssl = { rejectUnauthorized };
  }

  const pool = new Pool(poolConfig);
  const run = createMigrationRunner(pool);

  try {
    await run();
    console.log("[migrate] Migrations completed successfully.");
  } catch (err) {
    console.error("[migrate] Migration failed:", err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
  process.exit(0);
}

main();
