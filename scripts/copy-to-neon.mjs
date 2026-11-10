// One-way copy: local MySQL  →  Neon PostgreSQL
//   npm run copy-to-neon
//
// • Reads MySQL with SELECT only — your local MySQL data is never changed.
// • Copies: page content (site_content), contact messages (same ids + dates), uploaded images (/uploads).
// • Safe to run again: existing rows in Neon are updated, nothing is duplicated.
// Settings come from .env.local: DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME and NEON_DATABASE_URL.
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import pg from "pg";
import nextEnv from "@next/env";

// read .env.local exactly the way Next.js does (so passwords with \$ etc. match)
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });

const NEON = process.env.NEON_DATABASE_URL;
if (!NEON) {
  console.error("✗ NEON_DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const neonUrl = new URL(NEON);
neonUrl.searchParams.delete("sslmode");
neonUrl.searchParams.delete("channel_binding");

const my = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "honey_lab",
});
const neon = new pg.Client({ connectionString: neonUrl.toString(), ssl: { rejectUnauthorized: true } });
await neon.connect();
console.log(`✓ Connected — MySQL "${process.env.DB_NAME || "honey_lab"}" → Neon "${neonUrl.pathname.slice(1)}" @ ${neonUrl.hostname}`);

try {
  // --- tables in Neon (same structure the app creates) ---
  await neon.query(`CREATE TABLE IF NOT EXISTS site_content (
    section VARCHAR(50) PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  await neon.query(`CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY, name VARCHAR(120) NOT NULL, email VARCHAR(190) NOT NULL,
    message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  await neon.query(`CREATE TABLE IF NOT EXISTS uploads (
    name VARCHAR(64) PRIMARY KEY, mime VARCHAR(40) NOT NULL, data BYTEA NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);

  await neon.query("BEGIN");

  // --- 1. page content ---
  const [sections] = await my.query("SELECT section, data, updated_at FROM site_content");
  for (const r of sections) {
    const data = typeof r.data === "string" ? r.data : JSON.stringify(r.data);
    await neon.query(
      `INSERT INTO site_content (section, data, updated_at) VALUES ($1, $2, COALESCE($3, NOW()))
       ON CONFLICT (section) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`,
      [r.section, data, r.updated_at]
    );
  }
  console.log(`✓ site_content: ${sections.length} sections (${sections.map((s) => s.section).join(", ")})`);

  // --- 2. contact messages (keep ids + dates) ---
  const [messages] = await my.query("SELECT id, name, email, message, created_at FROM contact_messages ORDER BY id");
  for (const r of messages) {
    await neon.query(
      `INSERT INTO contact_messages (id, name, email, message, created_at) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, message = EXCLUDED.message, created_at = EXCLUDED.created_at`,
      [r.id, r.name, r.email, r.message, r.created_at]
    );
  }
  // make new messages continue after the highest copied id
  await neon.query(
    "SELECT setval(pg_get_serial_sequence('contact_messages', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM contact_messages), 1), (SELECT COUNT(*) > 0 FROM contact_messages))"
  );
  console.log(`✓ contact_messages: ${messages.length} messages`);

  // --- 3. uploaded images ---
  const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
  const dir = path.join(process.cwd(), "uploads");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^[a-f0-9]{16}\.(jpg|png|webp|gif)$/.test(f)) : [];
  for (const f of files) {
    await neon.query("INSERT INTO uploads (name, mime, data) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING", [
      f,
      MIME[f.split(".").pop()],
      fs.readFileSync(path.join(dir, f)),
    ]);
  }
  console.log(`✓ uploads: ${files.length} images`);

  await neon.query("COMMIT");

  // --- verify ---
  const check = async (t) => Number((await neon.query(`SELECT COUNT(*) AS n FROM ${t}`)).rows[0].n);
  console.log(`\nNeon now has → site_content: ${await check("site_content")}, contact_messages: ${await check("contact_messages")}, uploads: ${await check("uploads")}`);
  console.log("Done. Local MySQL was only read, not changed.");
} catch (err) {
  await neon.query("ROLLBACK").catch(() => {});
  console.error("✗ Copy failed, Neon was rolled back:", err.message);
  process.exitCode = 1;
} finally {
  await my.end();
  await neon.end();
}
