/**
 * GET  /api/admin/admins — admin users with active session counts (owner only)
 * POST /api/admin/admins — create an admin { email, name, role, password }
 */

import { MongoServerError } from "mongodb";
import { z } from "zod";
import { adminCollections } from "@/lib/admin/db";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/admin/password";
import { audit } from "@/lib/admin/query";
import { adminRoute, fail, OWNER, readJson } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = adminRoute(OWNER, async () => {
  const { admins, sessions } = await adminCollections();
  const [list, active] = await Promise.all([
    admins.find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: 1 }).toArray(),
    sessions
      .aggregate<{ _id: unknown; n: number }>([
        { $match: { expiresAt: { $gt: new Date() } } },
        { $group: { _id: "$adminId", n: { $sum: 1 } } },
      ])
      .toArray(),
  ]);
  const counts = new Map(active.map((row) => [String(row._id), row.n]));
  return list.map(({ _id, ...a }) => ({
    ...a,
    createdBy: undefined,
    id: String(_id),
    activeSessions: counts.get(String(_id)) || 0,
  }));
});

const CreateBody = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  name: z.string().trim().min(1).max(100),
  role: z.enum(["owner", "support", "editor"]),
  password: z.string().max(200),
});

export const POST = adminRoute(OWNER, async ({ req, admin }) => {
  const body = CreateBody.safeParse(await readJson(req));
  if (!body.success) fail(400, "Enter a name, a valid email and a role.");
  if (body.data.password.length < MIN_PASSWORD_LENGTH) {
    fail(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  const { admins } = await adminCollections();
  const now = new Date();
  try {
    const result = await admins.insertOne({
      email: body.data.email,
      name: body.data.name,
      role: body.data.role,
      active: true,
      passwordHash: await hashPassword(body.data.password),
      createdAt: now,
      updatedAt: now,
      createdBy: admin._id,
    });
    await audit(admin, "admin.create", { type: "admin", id: String(result.insertedId) }, {
      email: body.data.email,
      role: body.data.role,
    });
    return { id: String(result.insertedId), email: body.data.email, name: body.data.name, role: body.data.role, active: true };
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) fail(409, "An admin with this email already exists.");
    throw err;
  }
});
