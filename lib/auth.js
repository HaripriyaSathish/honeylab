// Single-password admin login using a signed, HttpOnly cookie.
import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "hl_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
const sign = (value) => crypto.createHmac("sha256", secret()).update(value).digest("hex");
const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();

export function checkCredentials(username, password) {
  const realUser = process.env.ADMIN_USERNAME || "admin";
  const realPass = process.env.ADMIN_PASSWORD;
  if (!realPass) return false;
  const userOk = crypto.timingSafeEqual(sha(username), sha(realUser));
  const passOk = crypto.timingSafeEqual(sha(password), sha(realPass));
  return userOk && passOk;
}

export function createToken() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return `${exp}.${sign(exp)}`;
}

function verifyToken(token) {
  if (!token || !secret()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = sign(exp);
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export async function isAdmin() {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};
