import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const rows = await db.listMessages();
  return NextResponse.json(rows);
}

export async function DELETE(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = await getDb();
  await db.deleteMessage(id);
  return NextResponse.json({ ok: true });
}
