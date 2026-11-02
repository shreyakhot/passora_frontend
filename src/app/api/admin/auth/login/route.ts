/**
 * POST /api/admin/auth/login — sign in; sets the HttpOnly session cookie.
 * Rate limit: 5 failed attempts per email and 20 per IP in 15 minutes.
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { adminCollections } from "@/lib/admin/db";
import { hashPassword, verifyPassword } from "@/lib/admin/password";
import { audit } from "@/lib/admin/query";
import { clientIp, hashIp, startSession } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FAILS_PER_EMAIL = 5;
const MAX_FAILS_PER_IP = 20;

const Body = z.object({
  email: z.string().trim().toLowerCase().max(200),
  password: z.string().max(200),
});

// Compared against when the email is unknown, so timing does not reveal it
let dummyHash: Promise<string> | null = null;

function error(status: number, detail: string) {
  return NextResponse.json({ detail }, { status });
}

export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-request") !== "1") return error(400, "Missing X-Admin-Request header.");
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return error(400, "Enter your email and password.");
  const { email, password } = parsed.data;

  try {
    const { admins, loginAttempts } = await adminCollections();
    const ipHash = hashIp(clientIp(req));

    const [failsEmail, failsIp] = await Promise.all([
      loginAttempts.countDocuments({ email }),
      ipHash ? loginAttempts.countDocuments({ ipHash }) : Promise.resolve(0),
    ]);
    if (failsEmail >= MAX_FAILS_PER_EMAIL || failsIp >= MAX_FAILS_PER_IP) {
      return error(429, "Too many failed sign-in attempts. Try again in 15 minutes.");
    }

    const admin = await admins.findOne({ email });
    dummyHash ??= hashPassword("not-a-real-password");
    const ok = await verifyPassword(password, admin?.passwordHash || (await dummyHash));
    if (!admin || !admin.active || !ok) {
      await loginAttempts.insertOne({ email, ipHash, createdAt: new Date() });
      return error(401, "Incorrect email or password.");
    }

    await loginAttempts.deleteMany({ email });
    await admins.updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } });

    const user = { id: admin._id.toString(), email: admin.email, name: admin.name || admin.email, role: admin.role };
    const res = NextResponse.json({ admin: user });
    await startSession(res, admin._id, req);
    await audit({ ...user, _id: admin._id, tokenHash: "" }, "auth.login", { type: "admin", id: user.id });
    return res;
  } catch (err) {
    console.error("[admin] login failed:", err);
    return error(500, "Sign-in is unavailable right now. Check the database connection.");
  }
}
