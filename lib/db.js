// MySQL connection (server-side only).
// Settings come from .env.local — see .env.example.
import mysql from "mysql2/promise";
import { DEFAULT_CONTENT } from "./defaultContent";

const DB_NAME = process.env.DB_NAME || "honey_lab";

async function init() {
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

  // 2. connection pool for the app
  const pool = mysql.createPool({ ...base, database: DB_NAME, connectionLimit: 5, charset: "utf8mb4" });

  // 3. tables
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

  // 4. seed default content for any section that has no row yet
  for (const [section, data] of Object.entries(DEFAULT_CONTENT)) {
    await pool.query("INSERT IGNORE INTO site_content (section, data) VALUES (?, ?)", [section, JSON.stringify(data)]);
  }
  return pool;
}

// keep one pool across hot reloads in dev
const g = globalThis;
export function getPool() {
  if (!g.__honeyPool) {
    g.__honeyPool = init().catch((err) => {
      g.__honeyPool = null; // retry on next request
      throw err;
    });
  }
  return g.__honeyPool;
}
