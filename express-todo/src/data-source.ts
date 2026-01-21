/**
 * Data Source Configuration
 * =========================
 *
 * This file configures the connection to the SQLite database using TypeORM.
 *
 * Concepts
 * --------
 * - **DataSource**: The main entry point for TypeORM. It performs the connection
 *   establishment and holds the configuration for the database driver.
 * - **Synchronization**: When `synchronize: true` is set, TypeORM will automatically
 *   create database tables for all entities found in the `entities` array.
 *   This is great for development but **dangerous for production** (can cause data loss).
 *
 * Usage
 * -----
 * We initialize this DataSource in `index.ts` before starting the Express server.
 */

import { DataSource } from "typeorm";
import { ToDoItem } from "./models/ToDoItem";

export const AppDataSource = new DataSource({
  // Use the built-in SQLite driver
  type: "sqlite",
  // The file where the database will be stored (relative to project root)
  database: "db.sqlite",
  // List of entities to load. We must register all our models here.
  entities: [ToDoItem],
  // Auto-generate schema on startup (Dev only)
  synchronize: true,
  // Logging queries can be helpful for debugging
  logging: false,
});
