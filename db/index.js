import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });

// Test database connection
try {
  await client.query('SELECT 1');
  console.log('Database connected successfully');
} catch (error) {
  console.error('Database connection failed:', error);
  throw error;
}