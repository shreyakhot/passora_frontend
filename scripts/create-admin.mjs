#!/usr/bin/env node
/**
 * Create an admin panel account.
 *
 *   npm run create-admin                                   (asks for email, name, password)
 *   npm run create-admin you@example.com "Your Name" [owner|support|editor]
 *
 * Prompts for the password (hidden), or reads ADMIN_PASSWORD. Uses MONGODB_URI
 * and MONGODB_DB_NAME from .env. The hash format matches src/lib/admin/password.ts.
 */

import crypto from "node:crypto";
import readline from "node:readline";
import { parseArgs } from "node:util";
import { MongoClient } from "mongodb";

const ROLES = ["owner", "support", "editor"];
const MIN_PASSWORD_LENGTH = 10;

// Flags (--email, --name, --role) or plain arguments in that order. PowerShell
// drops the "--" in `npm run create-admin -- --email ...`, so npm swallows the
// flags; plain arguments and the prompts below work in every shell.
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string" },
  },
});

function exit(message) {
  console.error(message);
  process.exit(1);
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

if (!process.env.MONGODB_URI) exit("MONGODB_URI is not set. Run this from the frontend folder so .env is loaded.");

const email = (values.email || positionals[0] || (await ask("Email: "))).trim().toLowerCase();
const name = (values.name || positionals[1] || (await ask("Name: "))).trim();
const role = (values.role || positionals[2] || "owner").trim().toLowerCase();

if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) exit(`"${email}" is not a valid email address.`);
if (!name) exit("A name is required.");
if (!ROLES.includes(role)) exit(`Role must be one of: ${ROLES.join(", ")}`);

/** Prompt without echoing what is typed. */
function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => {
      if (text.startsWith(question)) rl.output.write(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

function hashPassword(password) {
  const N = 16384;
  const r = 8;
  const p = 1;
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N, r, p, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  password = await askHidden("Password: ");
  if ((await askHidden("Repeat password: ")) !== password) exit("Passwords do not match.");
}
if (password.length < MIN_PASSWORD_LENGTH) exit(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);

const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
try {
  await client.connect();
  const admins = client.db(process.env.MONGODB_DB_NAME || "photo_govt").collection("admins");
  await admins.createIndex({ email: 1 }, { unique: true });
  const now = new Date();
  await admins.insertOne({
    email,
    name,
    role,
    active: true,
    passwordHash: hashPassword(password),
    createdAt: now,
    updatedAt: now,
  });
  console.log(`Created ${role} account for ${email}. Sign in at /admin/login.`);
} catch (err) {
  if (err?.code === 11000) exit(`An admin with email ${email} already exists.`);
  exit(`Could not create the admin: ${err?.message || err}`);
} finally {
  await client.close();
}
