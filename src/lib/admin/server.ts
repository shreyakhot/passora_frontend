/**
 * Admin panel — server-only session handling and the route-handler wrapper
 * used by every /api/admin/* endpoint.
 *
 * Sessions: a random token in an HttpOnly cookie; only its SHA-256 is stored
 * in admin_sessions (expired by a TTL index on expiresAt).
 */

import crypto from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { ObjectId } from "mongodb";
import { adminCollections, type AdminRole } from "@/lib/admin/db";

export const ADMIN_COOKIE = "admin_session";
const SESSION_HOURS = Number(process.env.ADMIN_SESSION_HOURS) || 12;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface AdminContext extends AdminUser {
  _id: ObjectId;
  tokenHash: string;
}

export const STAFF: AdminRole[] = ["owner", "support"];
export const ANY_ADMIN: AdminRole[] = ["owner", "support", "editor"];
export const OWNER: AdminRole[] = ["owner"];

// ─── Errors ───

export class AdminHttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export function fail(status: number, detail: string): never {
  throw new AdminHttpError(status, detail);
}

// ─── Tokens & cookies ───

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function hashIp(ip: string | null | undefined): string | undefined {
  if (!ip) return undefined;
  return crypto.createHash("sha256").update(`admin:${ip}`).digest("hex").slice(0, 32);
}

export function clientIp(req: NextRequest): string | undefined {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Create a session and set its cookie on `res`. */
export async function startSession(res: NextResponse, adminId: ObjectId, req: NextRequest) {
  const { sessions } = await adminCollections();
  const token = crypto.randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_HOURS * 3600_000);
  await sessions.insertOne({
    tokenHash: hashToken(token),
    adminId,
    createdAt: now,
    lastSeenAt: now,
    expiresAt,
    userAgent: (req.headers.get("user-agent") || "").slice(0, 300),
  });
  res.cookies.set(ADMIN_COOKIE, token, cookieOptions(SESSION_HOURS * 3600));
  return expiresAt;
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, "", cookieOptions(0));
}

/** Resolve a session token to its admin, or null when missing, expired or disabled. */
async function resolveSession(token: string | undefined): Promise<AdminContext | null> {
  if (!token) return null;
  const { sessions, admins } = await adminCollections();
  const tokenHash = hashToken(token);
  const session = await sessions.findOne({ tokenHash });
  // The TTL monitor runs about once a minute, so check expiry here too
  if (!session || session.expiresAt <= new Date()) return null;
  const admin = await admins.findOne({ _id: session.adminId });
  if (!admin || !admin.active) return null;

  if (Date.now() - session.lastSeenAt.getTime() > 60_000) {
    await sessions.updateOne({ _id: session._id }, { $set: { lastSeenAt: new Date() } });
  }
  return {
    _id: admin._id!,
    id: admin._id!.toString(),
    email: admin.email,
    name: admin.name || admin.email,
    role: admin.role,
    tokenHash,
  };
}

/** The signed-in admin for server components, or null. Deduplicated per request. */
export const getAdminSession = cache(async (): Promise<AdminUser | null> => {
  try {
    const ctx = await resolveSession((await cookies()).get(ADMIN_COOKIE)?.value);
    return ctx ? { id: ctx.id, email: ctx.email, name: ctx.name, role: ctx.role } : null;
  } catch (err) {
    console.error("[admin] Session lookup failed:", err);
    return null;
  }
});

// ─── Route wrapper ───

type Handler<P> = (ctx: {
  req: NextRequest;
  admin: AdminContext;
  params: P;
}) => Promise<NextResponse | Response | object>;

/**
 * Wraps an /api/admin route handler:
 * - requires a valid session with one of `roles`
 * - requires `X-Admin-Request: 1` on mutating requests (blocks cross-site form posts)
 * - turns AdminHttpError into `{ detail }` JSON with its status
 * - plain objects returned by the handler are sent as JSON
 */
export function adminRoute<P = Record<string, never>>(roles: AdminRole[], handler: Handler<P>) {
  return async (req: NextRequest, ctx: { params: Promise<P> }) => {
    try {
      if (req.method !== "GET" && req.method !== "HEAD" && req.headers.get("x-admin-request") !== "1") {
        fail(400, "Missing X-Admin-Request header.");
      }
      const admin = await resolveSession(req.cookies.get(ADMIN_COOKIE)?.value);
      if (!admin) {
        const res = NextResponse.json({ detail: "Not signed in or your session has expired." }, { status: 401 });
        clearSessionCookie(res);
        return res;
      }
      if (!roles.includes(admin.role)) fail(403, "You do not have permission to do this.");

      const result = await handler({ req, admin, params: await ctx.params });
      if (result instanceof Response) return result;
      return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
      if (err instanceof AdminHttpError) {
        return NextResponse.json({ detail: err.message }, { status: err.status });
      }
      console.error(`[admin] ${req.method} ${req.nextUrl.pathname} failed:`, err);
      return NextResponse.json({ detail: "Server error. Check the logs." }, { status: 500 });
    }
  };
}

/** Parse a JSON body or fail with 400. */
export async function readJson<T = Record<string, unknown>>(req: NextRequest): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    fail(400, "Invalid JSON body.");
  }
}
