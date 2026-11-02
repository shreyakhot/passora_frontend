/**
 * Owner-only management of one admin user.
 *   PATCH /api/admin/admins/[id]                   { name?, role?, active? }
 *   POST  /api/admin/admins/[id]/reset-password    { password } — also signs them out
 *   POST  /api/admin/admins/[id]/revoke-sessions
 * Guards: you cannot disable or demote yourself, and one active owner must remain.
 */

import { ObjectId } from "mongodb";
import { z } from "zod";
import { adminCollections } from "@/lib/admin/db";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/admin/password";
import { audit } from "@/lib/admin/query";
import { adminRoute, fail, OWNER, readJson } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { id: string; action?: string[] };

function objectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) fail(404, "Admin not found.");
  return new ObjectId(id);
}

const PatchBody = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  role: z.enum(["owner", "support", "editor"]).optional(),
  active: z.boolean().optional(),
});

export const PATCH = adminRoute<Params>(OWNER, async ({ req, admin, params }) => {
  if (params.action?.length) fail(404, "Not found.");
  const _id = objectId(params.id);
  const body = PatchBody.safeParse(await readJson(req));
  if (!body.success || !Object.keys(body.data).length) fail(400, "Nothing to change.");
  const changes = body.data;

  const { admins, sessions } = await adminCollections();
  const target = await admins.findOne({ _id });
  if (!target) fail(404, "Admin not found.");

  const losesOwner = changes.active === false || (changes.role !== undefined && changes.role !== "owner");
  if (_id.equals(admin._id) && losesOwner) fail(400, "You cannot disable or demote your own account.");
  if (target.role === "owner" && target.active && losesOwner) {
    if ((await admins.countDocuments({ role: "owner", active: true })) <= 1) {
      fail(400, "There must be at least one active owner.");
    }
  }

  await admins.updateOne({ _id }, { $set: { ...changes, updatedAt: new Date() } });
  // Role changes apply on the next request; disabled admins are signed out
  if (changes.active === false) await sessions.deleteMany({ adminId: _id });
  await audit(admin, "admin.update", { type: "admin", id: params.id }, changes);

  const updated = await admins.findOne({ _id }, { projection: { passwordHash: 0 } });
  return { ...updated, _id: undefined, id: params.id };
});

export const POST = adminRoute<Params>(OWNER, async ({ req, admin, params }) => {
  const _id = objectId(params.id);
  const action = params.action?.join("/");
  const { admins, sessions } = await adminCollections();

  if (action === "reset-password") {
    const body = z.object({ password: z.string().max(200) }).safeParse(await readJson(req));
    if (!body.success || body.data.password.length < MIN_PASSWORD_LENGTH) {
      fail(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    const result = await admins.updateOne(
      { _id },
      { $set: { passwordHash: await hashPassword(body.data.password), updatedAt: new Date() } }
    );
    if (!result.matchedCount) fail(404, "Admin not found.");
    await sessions.deleteMany({ adminId: _id });
    await audit(admin, "admin.reset_password", { type: "admin", id: params.id });
    return { ok: true };
  }

  if (action === "revoke-sessions") {
    await sessions.deleteMany({ adminId: _id });
    await audit(admin, "admin.revoke_sessions", { type: "admin", id: params.id });
    return { ok: true };
  }

  fail(404, "Not found.");
});
