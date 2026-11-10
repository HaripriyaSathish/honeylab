// Public contact form → saved in the contact_messages table
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req) {
  const { name, email, message } = await req.json().catch(() => ({}));
  const clean = (v, max) => String(v || "").trim().slice(0, max);
  const n = clean(name, 120), e = clean(email, 190), m = clean(message, 5000);
  if (!n || !/^\S+@\S+\.\S+$/.test(e) || !m) {
    return NextResponse.json({ error: "Please fill in name, a valid email and a message" }, { status: 400 });
  }
  try {
    const db = await getDb();
    await db.insertMessage(n, e, m);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err.message);
    return NextResponse.json({ error: "Could not send right now, please try again later" }, { status: 500 });
  }
}
