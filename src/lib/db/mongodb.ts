/**
 * MongoDB Connection Utility
 * Caches the MongoClient across hot reloads in dev and across
 * serverless function invocations in production via the global object.
 */

import { MongoClient, type Db } from "mongodb";

interface MongoGlobal {
  _mongoClientPromise?: Promise<MongoClient>;
}

const g = globalThis as unknown as MongoGlobal;

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
};

export function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is not defined. Add it to .env.local"
    );
  }

  if (!g._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    const promise = client.connect();
    g._mongoClientPromise = promise;
    // Drop a failed connection so the next request retries instead of
    // reusing the rejected promise until the server restarts.
    promise.catch(() => {
      if (g._mongoClientPromise === promise) g._mongoClientPromise = undefined;
    });
  }
  return g._mongoClientPromise;
}

// Existing deployments must set MONGODB_DB_NAME to keep reading their current database.
const DB_NAME = process.env.MONGODB_DB_NAME || "photo_govt";

/**
 * Returns a connected Db instance.
 * Call this in every API route / server action — connection is cached.
 */
export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}
