import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "ascindrix_admin";

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
const sessionToken = () => createHmac("sha256", secret()).update("ascindrix-admin").digest("hex");

const sha = (v: string) => createHash("sha256").update(v).digest();

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(sha(input), sha(expected));
}

export async function startSession() {
  (await cookies()).set(COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  return timingSafeEqual(sha(value), sha(sessionToken()));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
