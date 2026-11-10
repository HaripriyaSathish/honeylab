// Database layer (server-side only). Two backends, same functions:
//   • DATABASE_URL set  → PostgreSQL (Neon) — used on Render
//   • otherwise         → MySQL (DB_HOST / DB_USER / DB_PASSWORD / DB_NAME) — used locally
// Tables are created automatically and default content is seeded on first use.
import mysql from "mysql2/promise";
import pg from "pg";
import { DEFAULT_CONTENT } from "./defaultContent";

export const usingPostgres = () => Boolean(process.env.DATABASE_URL);

/* ---------------- PostgreSQL (Neon) ---------------- */
export function pgConfig(url) {
  // node-postgres handles SSL itself; drop libpq-only URL options it doesn't need
  const u = new URL(url);
  u.searchParams.delete("sslmode");
  u.searchParams.delete("channel_binding");
  return { connectionString: u.toString(), ssl: { rejectUnauthorized: true }, max: 5, idleTimeoutMillis: 30000 };
}

export async function createPgTables(q) {
  await q(`CREATE TABLE IF NOT EXISTS site_content (
    section    VARCHAR(50) PRIMARY KEY,
    data       JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await q(`CREATE TABLE IF NOT EXISTS contact_messages (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(120) NOT NULL,
    email      VARCHAR(190) NOT NULL,
    message    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await q(`CREATE TABLE IF NOT EXISTS uploads (
    name       VARCHAR(64) PRIMARY KEY,
    mime       VARCHAR(40) NOT NULL,
    data       BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}

async function initPg() {
  const pool = new pg.Pool(pgConfig(process.env.DATABASE_URL));
  const q = (sql, params) => pool.query(sql, params);
  await createPgTables(q);
  for (const [section, data] of Object.entries(DEFAULT_CONTENT)) {
    await q("INSERT INTO site_content (section, data) VALUES ($1, $2) ON CONFLICT (section) DO NOTHING", [section, JSON.stringify(data)]);
  }
  return {
    kind: "postgres",
    async getSections() {
      return (await q("SELECT section, data FROM site_content")).rows;
    },
    async upsertSection(section, data) {
      await q(
        `INSERT INTO site_content (section, data, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (section) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
        [section, JSON.stringify(data)]
      );
    },
    async insertMessage(name, email, message) {
      await q("INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)", [name, email, message]);
    },
    async listMessages() {
      return (await q("SELECT id, name, email, message, created_at FROM contact_messages ORDER BY id DESC LIMIT 200")).rows;
    },
    async deleteMessage(id) {
      await q("DELETE FROM contact_messages WHERE id = $1", [id]);
    },
    async saveUpload(name, mime, buffer) {
      await q("INSERT INTO uploads (name, mime, data) VALUES ($1, $2, $3)", [name, mime, buffer]);
    },
    async getUpload(name) {
      return (await q("SELECT mime, data FROM uploads WHERE name = $1", [name])).rows[0] || null;
    },
  };
}

/* ---------------- MySQL (local) ---------------- */
async function initMysql() {
  const DB_NAME = process.env.DB_NAME || "honey_lab";
  const base = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  };

  // 1. make sure the database exists
  const conn = await mysql.createConnection(base);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();

  // 2. connection pool + tables
  const pool = mysql.createPool({ ...base, database: DB_NAME, connectionLimit: 5, charset: "utf8mb4" });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      section    VARCHAR(50) PRIMARY KEY,
      data       JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(120) NOT NULL,
      email      VARCHAR(190) NOT NULL,
      message    TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

  // 3. seed default content for any section that has no row yet
  for (const [section, data] of Object.entries(DEFAULT_CONTENT)) {
    await pool.query("INSERT IGNORE INTO site_content (section, data) VALUES (?, ?)", [section, JSON.stringify(data)]);
  }

  return {
    kind: "mysql",
    async getSections() {
      return (await pool.query("SELECT section, data FROM site_content"))[0];
    },
    async upsertSection(section, data) {
      await pool.query("INSERT INTO site_content (section, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)", [
        section,
        JSON.stringify(data),
      ]);
    },
    async insertMessage(name, email, message) {
      await pool.query("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)", [name, email, message]);
    },
    async listMessages() {
      return (await pool.query("SELECT id, name, email, message, created_at FROM contact_messages ORDER BY id DESC LIMIT 200"))[0];
    },
    async deleteMessage(id) {
      await pool.query("DELETE FROM contact_messages WHERE id = ?", [id]);
    },
    // locally, uploaded images are plain files in /uploads (see app/api/admin/upload)
    saveUpload: null,
    getUpload: null,
  };
}

// keep one connection pool across hot reloads in dev
const g = globalThis;
export function getDb() {
  if (!g.__honeyDb) {
    g.__honeyDb = (usingPostgres() ? initPg() : initMysql()).catch((err) => {
      g.__honeyDb = null; // retry on next request
      throw err;
    });
  }
  return g.__honeyDb;
}
