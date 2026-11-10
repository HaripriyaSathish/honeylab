import { NextResponse } from "next/server";
import { checkCredentials, createToken, COOKIE_NAME, cookieOptions } from "@/lib/auth";

export async function POST(req) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not set in .env.local" }, { status: 500 });
  }
  const { username, password } = await req.json().catch(() => ({}));
  if (!checkCredentials(username || "", password || "")) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return NextResponse.json({ error: "Wrong username or password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, createToken(), cookieOptions);
  return res;
}
