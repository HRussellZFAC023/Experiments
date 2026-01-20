/**
 * Database Connection (Drizzle + SQLite)
 * =======================================
 *
 * This module initializes the database connection and exports the Drizzle client.
 *
 * Database Setup
 * --------------
 * We use better-sqlite3, a synchronous SQLite driver for Node.js.
 * It's faster than async alternatives for SQLite since SQLite
 * operations are inherently synchronous at the file system level.
 *
 * Drizzle Client
 * --------------
 * The drizzle() function wraps the database driver and provides:
 *   - Type-safe query builder
 *   - Schema awareness
 *   - Prepared statements
 *   - Transaction support
 *
 * Query Examples
 * --------------
 * ```typescript
 * import { db } from "@/lib/db";
 * import { todoItems } from "@/lib/schema";
 * import { eq, desc } from "drizzle-orm";
 *
 * // SELECT all items
 * const items = db.select().from(todoItems).all();
 *
 * // SELECT with ordering
 * const newest = db.select().from(todoItems).orderBy(desc(todoItems.createdOn)).all();
 *
 * // INSERT new item
 * db.insert(todoItems).values({ text: "New task" }).run();
 *
 * // UPDATE existing item
 * db.update(todoItems).set({ completed: true }).where(eq(todoItems.id, 1)).run();
 *
 * // DELETE item
 * db.delete(todoItems).where(eq(todoItems.id, 1)).run();
 * ```
 *
 * Schema Initialization
 * ---------------------
 * We create the table if it doesn't exist using raw SQL.
 * In production, you'd typically use Drizzle migrations:
 *   npx drizzle-kit generate
 *   npx drizzle-kit migrate
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

/**
 * SQLite database file path.
 * Stored in the project root's data directory.
 */
const DB_PATH = "./data/database.db";

/**
 * Initialize SQLite connection.
 * better-sqlite3 is synchronous and thread-safe.
 */
const sqlite = new Database(DB_PATH);

/**
 * Enable WAL mode for better concurrent read performance.
 * WAL (Write-Ahead Logging) allows readers to not block writers.
 */
sqlite.pragma("journal_mode = WAL");

/**
 * Create table if it doesn't exist.
 * This is a simple alternative to running migrations for development.
 * In production, use drizzle-kit migrations instead.
 */
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS todo_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_on TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
  )
`);

/**
 * Drizzle database client.
 *
 * Exports the configured Drizzle instance with schema awareness.
 * Use this for all database operations.
 *
 * @example
 * import { db } from "@/lib/db";
 * import { todoItems } from "@/lib/schema";
 *
 * const items = db.select().from(todoItems).all();
 */
export const db = drizzle(sqlite, { schema });
