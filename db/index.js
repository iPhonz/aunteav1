import { drizzle } from "drizzle-orm/pg";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
export { sql };

// Test database connection
pool.connect()
  .then(client => {
    client.query('SELECT 1')
      .then(() => {
        console.log('Database connected successfully');
        client.release();
      })
      .catch(err => {
        console.error('Database query failed:', err);
        client.release();
        throw err;
      });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    throw err;
  });