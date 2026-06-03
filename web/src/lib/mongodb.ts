import mongoose from "mongoose";
import { debugLog } from "./debug";

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cache;

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export async function connectMongo(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI non configurato");
  }

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    debugLog(3, "mongo", "Connecting to MongoDB");
    cache.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  cache.conn = await cache.promise;
  debugLog(4, "mongo", "MongoDB connected");
  return cache.conn;
}
