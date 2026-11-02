/**
 * Admin panel — MongoDB collections owned by the admin panel.
 * Shares the database with payments, user_activity_logs and webhook_events.
 */

import { type Collection, type Db, type ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";

export type AdminRole = "owner" | "support" | "editor";

export interface AdminDocument {
  _id?: ObjectId;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: ObjectId;
  lastLoginAt?: Date;
}

export interface AdminSessionDocument {
  _id?: ObjectId;
  /** SHA-256 of the session token; the token itself is only in the cookie */
  tokenHash: string;
  adminId: ObjectId;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  userAgent?: string;
}

export interface AdminLoginAttemptDocument {
  email: string;
  ipHash?: string;
  createdAt: Date;
}

export interface AdminAuditLogDocument {
  adminId?: ObjectId;
  adminEmail?: string;
  adminName?: string;
  action: string;
  target: { type: string; id?: string | null };
  details?: Record<string, unknown>;
  createdAt: Date;
}

let _ensured = false;

async function ensureIndexes(db: Db) {
  if (_ensured) return;
  await Promise.all([
    db.collection("admins").createIndex({ email: 1 }, { unique: true }),
    db.collection("admin_sessions").createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection("admin_sessions").createIndex({ adminId: 1 }),
    db.collection("admin_sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("admin_login_attempts").createIndex({ email: 1 }),
    db.collection("admin_login_attempts").createIndex({ ipHash: 1 }),
    db.collection("admin_login_attempts").createIndex({ createdAt: 1 }, { expireAfterSeconds: 15 * 60 }),
    db.collection("admin_audit_logs").createIndex({ createdAt: -1 }),
    db.collection("admin_audit_logs").createIndex({ "target.id": 1 }),
    // Upload → order joins for the user journey view
    db.collection("user_activity_logs").createIndex({ "metadata.resultId": 1 }, { sparse: true }),
  ]);
  _ensured = true;
}

export async function adminCollections() {
  const db = await getDb();
  await ensureIndexes(db);
  return {
    db,
    admins: db.collection<AdminDocument>("admins") as Collection<AdminDocument>,
    sessions: db.collection<AdminSessionDocument>("admin_sessions"),
    loginAttempts: db.collection<AdminLoginAttemptDocument>("admin_login_attempts"),
    auditLogs: db.collection<AdminAuditLogDocument>("admin_audit_logs"),
  };
}
