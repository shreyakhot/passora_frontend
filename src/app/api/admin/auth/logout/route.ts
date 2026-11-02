/**
 * POST /api/admin/auth/logout — ends the current session and clears the cookie.
 */

import { NextResponse, type NextRequest } from "next/server";
import { adminCollections } from "@/lib/admin/db";
import { ADMIN_COOKIE, clearSessionCookie, hashToken } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (token) {
    try {
      const { sessions } = await adminCollections();
      await sessions.deleteOne({ tokenHash: hashToken(token) });
    } catch (err) {
      console.error("[admin] logout cleanup failed:", err);
    }
  }
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
