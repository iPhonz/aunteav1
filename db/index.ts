import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// For query purposes
const queryClient = postgres(process.env.DATABASE_URL);
export const db = drizzle(queryClient, { schema });

// Test database connection with a simple query
queryClient`SELECT 1`.then(() => {
  console.log("Database connected successfully");
}).catch((error: Error) => {
  console.error("Database connection failed:", error);
  throw error;
});