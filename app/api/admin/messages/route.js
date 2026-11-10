import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pool = await getPool();
  const [rows] = await pool.query("SELECT id, name, email, message, created_at FROM contact_messages ORDER BY id DESC LIMIT 200");
  return NextResponse.json(rows);
}

export async function DELETE(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const pool = await getPool();
  await pool.query("DELETE FROM contact_messages WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
