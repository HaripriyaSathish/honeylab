// Serves images uploaded through the admin panel (from the database on Render, from /uploads locally).
import fs from "fs/promises";
import path from "path";
import { getDb } from "@/lib/db";

const TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
const headers = (type) => ({ "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" });

export async function GET(_req, { params }) {
  const { file } = await params;
  const match = /^[a-f0-9]{16}\.(jpg|png|webp|gif)$/.exec(file);
  if (!match) return new Response("Not found", { status: 404 });
  try {
    const db = await getDb();
    if (db.getUpload) {
      const row = await db.getUpload(file);
      if (row) return new Response(row.data, { headers: headers(row.mime) });
    }
    const data = await fs.readFile(path.join(process.cwd(), "uploads", file));
    return new Response(data, { headers: headers(TYPES[match[1]]) });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
