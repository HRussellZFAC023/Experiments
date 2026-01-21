/**
 * Server Actions for Todo App
 * ============================
 *
 * This module defines Server Actions - functions that run on the server
 * but can be called directly from client components.
 *
 * Next.js MVC Pattern - The "C" (Controller)
 * ------------------------------------------
 * In Next.js App Router architecture:
 *   - **Model**: Database schema and queries (lib/schema.ts, lib/db.ts)
 *   - **Controller**: Server Actions (THIS FILE)
 *   - **View**: React Server Components (app/page.tsx)
 *
 * Server Actions replace traditional API routes for form handling and mutations.
 *
 * What are Server Actions?
 * ------------------------
 * Server Actions are async functions marked with "use server" that:
 *   1. Run exclusively on the server (never bundled for client)
 *   2. Can be called from client components via form action or onClick
 *   3. Can mutate data and revalidate the cache
 *   4. Have access to server resources (database, file system, env vars)
 *
 * Server Actions vs API Routes
 * ----------------------------
 * | Feature              | Server Actions       | API Routes           |
 * |---------------------|---------------------|---------------------|
 * | Syntax              | Regular functions    | HTTP handlers        |
 * | Called from         | Forms, onClick       | fetch() requests     |
 * | Type safety         | End-to-end           | Manual typing        |
 * | CSRF protection     | Built-in             | Manual               |
 * | Progress/streaming  | Built-in             | Manual               |
 *
 * Form Handling
 * -------------
 * Server Actions receive FormData when used as form actions:
 *
 *   <form action={createItem}>
 *     <input name="text" />
 *   </form>
 *
 *   async function createItem(formData: FormData) {
 *     "use server";
 *     const text = formData.get("text") as string;
 *     // ... database operation
 *   }
 *
 * Revalidation
 * ------------
 * After mutating data, call revalidatePath() to refresh the page:
 *
 *   revalidatePath("/");  // Revalidate home page cache
 *
 * This causes Next.js to re-render Server Components with fresh data.
 *
 * Checkbox Handling (Same as Express/Django!)
 * --------------------------------------------
 * HTML checkboxes don't send any value when unchecked.
 * We detect this by checking if formData.get("completed") exists:
 *
 *   const completed = formData.get("completed") === "on";
 *
 *   - Checked: formData.get("completed") = "on" → true
 *   - Unchecked: formData.get("completed") = null → false
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { todoItems } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Get all todo items, newest first.
 *
 * This is a server function (not an action) that queries the database.
 * It can be called from Server Components directly.
 *
 * @returns Array of todo items ordered by creation date (newest first)
 */
export async function getItems() {
  // Using Drizzle ORM to build a typesafe SQL query.
  // SELECT * FROM todo_items ORDER BY created_on DESC;
  return db.select().from(todoItems).orderBy(desc(todoItems.createdOn)).all();
}

/**
 * Create a new todo item.
 *
 * Server Action that creates a new item and revalidates the page.
 * Called from the "Add" form via form action attribute.
 *
 * @param formData - Form data containing 'text' field
 */
export async function createItem(formData: FormData) {
  const text = formData.get("text") as string;

  if (!text || text.trim() === "") {
    return; // Silently ignore empty submissions
  }

  // Insert into database
  db.insert(todoItems).values({ text: text.trim() }).run();

  // Revalidate the home page to show the new item.
  // This tells Next.js to clear the cache for this path and re-render.
  revalidatePath("/");
}

/**
 * Update an existing todo item.
 *
 * Server Action that updates text and completion status.
 * Called from each item's update form.
 *
 * @param formData - Form data containing 'id', 'text', and optionally 'completed'
 *
 * Important - Checkbox Handling:
 *   HTML checkboxes do NOT send any value when unchecked.
 *   formData.get("completed") will be:
 *     - "on" when checked
 *     - null when unchecked
 */
export async function updateItem(formData: FormData) {
  const id = Number(formData.get("id"));
  const text = (formData.get("text") as string)?.trim() || "";

  // Checkbox sends "on" when checked, null when unchecked
  // This logic is identical to Django's item.completed = "completed" in request.POST
  const completed = formData.get("completed") === "on";

  db.update(todoItems)
    .set({ text, completed })
    .where(eq(todoItems.id, id))
    .run();

  revalidatePath("/");
}

/**
 * Delete a todo item.
 *
 * Server Action that removes an item from the database.
 * Called from each item's delete form.
 *
 * @param formData - Form data containing 'id'
 */
export async function deleteItem(formData: FormData) {
  const id = Number(formData.get("id"));

  db.delete(todoItems).where(eq(todoItems.id, id)).run();

  revalidatePath("/");
}
