/**
 * Database Schema (Drizzle ORM)
 * ==============================
 *
 * This module defines the database schema using Drizzle ORM.
 *
 * Next.js MVC Pattern - The "M" (Model)
 * -------------------------------------
 * In Next.js App Router architecture:
 *   - **Model**: Database schema and queries (this file + lib/db.ts)
 *   - **Controller**: Server Actions + API routes (app/actions.ts)
 *   - **View**: React Server Components (app/page.tsx)
 *
 * Drizzle ORM Features
 * --------------------
 * Drizzle is a TypeScript-first ORM that provides:
 *   - Type-safe database queries
 *   - Schema-as-code with TypeScript
 *   - Migration generation from schema changes
 *   - Support for multiple databases (SQLite, PostgreSQL, MySQL)
 *
 * Schema Definition
 * -----------------
 * Tables are defined using builder functions:
 *   - sqliteTable(): Creates a table definition
 *   - integer(), text(), etc.: Column type functions
 *   - primaryKey(), notNull(), default(): Column constraints
 *
 * Type Inference
 * --------------
 * Drizzle provides type inference for database operations:
 *   - $inferSelect: Type for rows returned from SELECT
 *   - $inferInsert: Type for data passed to INSERT
 *
 * Example:
 *   type ToDoItem = typeof todoItems.$inferSelect;
 *   // { id: number; text: string; createdOn: string; completed: boolean }
 */

import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

/**
 * Todo Items table schema.
 *
 * Columns:
 *   - id: Auto-incrementing primary key
 *   - text: Task description (required)
 *   - createdOn: ISO timestamp string (auto-set on insert)
 *   - completed: Boolean flag (defaults to false)
 */
export const todoItems = sqliteTable("todo_items", {
  /**
   * Primary key - auto-incrementing integer.
   * SQLite's ROWID is used internally.
   */
  id: integer("id").primaryKey({ autoIncrement: true }),

  /**
   * Task description.
   * Cannot be null.
   */
  text: text("text").notNull(),

  /**
   * Creation timestamp.
   * Stored as ISO 8601 string for SQLite compatibility.
   * Defaults to current timestamp using SQL function.
   */
  createdOn: text("created_on")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),

  /**
   * Completion status.
   * SQLite doesn't have native boolean, so we use integer (0/1).
   * Drizzle handles the conversion automatically.
   */
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
});

/**
 * Type for a todo item row (SELECT result).
 * Inferred from schema definition.
 */
export type ToDoItem = typeof todoItems.$inferSelect;

/**
 * Type for inserting a new todo item.
 * Some fields are optional due to defaults.
 */
export type NewToDoItem = typeof todoItems.$inferInsert;
