import { getDb } from "./db";
import { DEFAULT_CONTENT, SECTION_KEYS } from "./defaultContent";

const parse = (v) => (typeof v === "string" ? JSON.parse(v) : v);

// Reads every section from the database. Throws if the DB is unreachable.
export async function getContentStrict() {
  const db = await getDb();
  const rows = await db.getSections();
  const content = structuredClone(DEFAULT_CONTENT);
  for (const row of rows) {
    if (SECTION_KEYS.includes(row.section)) content[row.section] = { ...content[row.section], ...parse(row.data) };
  }
  return content;
}

// For the public site: never crash — fall back to defaults if the database is down.
export async function getContent() {
  try {
    return await getContentStrict();
  } catch (err) {
    console.error("[content] Database unavailable, using default content:", err.message);
    return structuredClone(DEFAULT_CONTENT);
  }
}

export async function saveSection(section, data) {
  if (!SECTION_KEYS.includes(section)) throw new Error(`Unknown section: ${section}`);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Section data must be an object");
  const db = await getDb();
  await db.upsertSection(section, data);
}
