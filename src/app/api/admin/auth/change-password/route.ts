/**
 * POST /api/admin/auth/change-password — signs out this admin's other sessions.
 */

import { z } from "zod";
import { adminCollections } from "@/lib/admin/db";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/admin/password";
import { audit } from "@/lib/admin/query";
import { adminRoute, ANY_ADMIN, fail, readJson } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ currentPassword: z.string().max(200), newPassword: z.string().max(200) });

export const POST = adminRoute(ANY_ADMIN, async ({ req, admin }) => {
  const body = Body.safeParse(await readJson(req));
  if (!body.success) fail(400, "Invalid request.");
  const { admins, sessions } = await adminCollections();
  const doc = await admins.findOne({ _id: admin._id });
  if (!doc || !(await verifyPassword(body.data.currentPassword, doc.passwordHash))) {
    fail(400, "Current password is incorrect.");
  }
  if (body.data.newPassword.length < MIN_PASSWORD_LENGTH) {
    fail(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  await admins.updateOne(
    { _id: admin._id },
    { $set: { passwordHash: await hashPassword(body.data.newPassword), updatedAt: new Date() } }
  );
  await sessions.deleteMany({ adminId: admin._id, tokenHash: { $ne: admin.tokenHash } });
  await audit(admin, "auth.change_password", { type: "admin", id: admin.id });
  return { ok: true };
});
