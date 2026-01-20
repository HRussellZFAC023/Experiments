/**
 * Tests for Todo App (Next.js + React Server Components)
 * =======================================================
 *
 * This module contains tests for the todo application.
 *
 * Testing Strategy for Next.js App Router
 * ----------------------------------------
 * Next.js App Router with Server Components presents unique testing challenges:
 *
 * 1. **Server Actions Testing**: Test database operations directly
 * 2. **Component Testing**: Test React components with Testing Library
 * 3. **Integration Testing**: Test full page renders (more complex with RSC)
 *
 * For Server Components and Actions, we primarily use:
 *   - Unit tests for database operations (similar to Django/Express)
 *   - Direct testing of Server Action functions
 *
 * Why Not Full Component Testing?
 * -------------------------------
 * React Server Components are challenging to test in unit tests because:
 *   - They render on the server only
 *   - They may have async data fetching
 *   - They use Server Actions which are server-only
 *
 * For production apps, consider:
 *   - E2E testing with Playwright or Cypress
 *   - Storybook for component development
 *   - API/action-level testing (what we do here)
 *
 * Test Organization
 * -----------------
 * - Database operations (Model layer)
 * - Server Actions (Controller layer)
 */

import { db } from "@/lib/db";
import { todoItems, ToDoItem } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

// =============================================================================
// TEST SETUP & TEARDOWN
// =============================================================================

/**
 * Clear all items before each test.
 */
beforeEach(() => {
  db.delete(todoItems).run();
});

// =============================================================================
// MODEL TESTS (Database Layer)
// =============================================================================

describe("TodoItems Database Operations", () => {
  /**
   * These tests verify that Drizzle ORM operations work correctly
   * with our SQLite database.
   */

  test("should insert a new item", () => {
    db.insert(todoItems).values({ text: "Test item" }).run();

    const items = db.select().from(todoItems).all();

    expect(items.length).toBe(1);
    expect(items[0]?.text).toBe("Test item");
    expect(items[0]?.completed).toBe(false);
  });

  test("should set createdOn automatically", () => {
    db.insert(todoItems).values({ text: "Test item" }).run();

    const item = db.select().from(todoItems).get();

    expect(item?.createdOn).toBeDefined();
    expect(typeof item?.createdOn).toBe("string");
  });

  test("should default completed to false", () => {
    db.insert(todoItems).values({ text: "Test item" }).run();

    const item = db.select().from(todoItems).get();

    expect(item?.completed).toBe(false);
  });

  test("should update an existing item", () => {
    db.insert(todoItems).values({ text: "Original" }).run();
    const item = db.select().from(todoItems).get();

    db.update(todoItems)
      .set({ text: "Updated", completed: true })
      .where(eq(todoItems.id, item!.id))
      .run();

    const updated = db.select().from(todoItems).get();

    expect(updated?.text).toBe("Updated");
    expect(updated?.completed).toBe(true);
  });

  test("should delete an item", () => {
    db.insert(todoItems).values({ text: "Delete me" }).run();
    const item = db.select().from(todoItems).get();

    db.delete(todoItems).where(eq(todoItems.id, item!.id)).run();

    const count = db.select().from(todoItems).all().length;

    expect(count).toBe(0);
  });

  test("should order items by createdOn descending", () => {
    // Insert with explicit timestamps to ensure ordering
    db.insert(todoItems).values({ text: "First", createdOn: "2024-01-01T00:00:00Z" }).run();
    db.insert(todoItems).values({ text: "Second", createdOn: "2024-01-02T00:00:00Z" }).run();
    db.insert(todoItems).values({ text: "Third", createdOn: "2024-01-03T00:00:00Z" }).run();

    const items = db
      .select()
      .from(todoItems)
      .orderBy(desc(todoItems.createdOn))
      .all();

    // Newest should be first
    expect(items[0]?.text).toBe("Third");
    expect(items[2]?.text).toBe("First");
  });
});

// =============================================================================
// SERVER ACTION SIMULATION TESTS
// =============================================================================

describe("Server Action Logic", () => {
  /**
   * These tests verify the logic that would be in Server Actions.
   * We test the database operations that the actions perform.
   */

  test("create action should insert item", () => {
    // Simulate what createItem action does
    const text = "New task";
    db.insert(todoItems).values({ text: text.trim() }).run();

    const items = db.select().from(todoItems).all();
    expect(items.length).toBe(1);
    expect(items[0]?.text).toBe("New task");
  });

  test("update action should modify item", () => {
    db.insert(todoItems).values({ text: "Original" }).run();
    const item = db.select().from(todoItems).get();

    // Simulate what updateItem action does
    const newText = "Modified";
    const completed = true;
    db.update(todoItems)
      .set({ text: newText, completed })
      .where(eq(todoItems.id, item!.id))
      .run();

    const updated = db.select().from(todoItems).get();
    expect(updated?.text).toBe("Modified");
    expect(updated?.completed).toBe(true);
  });

  test("update action should uncheck when completed is false", () => {
    // Create a completed item
    db.insert(todoItems).values({ text: "Done", completed: true }).run();
    const item = db.select().from(todoItems).get();

    // Simulate unchecking (completed = false in DB)
    db.update(todoItems)
      .set({ completed: false })
      .where(eq(todoItems.id, item!.id))
      .run();

    const updated = db.select().from(todoItems).get();
    expect(updated?.completed).toBe(false);
  });

  test("delete action should remove item", () => {
    db.insert(todoItems).values({ text: "Delete me" }).run();
    const item = db.select().from(todoItems).get();

    // Simulate what deleteItem action does
    db.delete(todoItems).where(eq(todoItems.id, item!.id)).run();

    const remaining = db.select().from(todoItems).all();
    expect(remaining.length).toBe(0);
  });

  test("delete action should not error on nonexistent item", () => {
    // Simulate deleting item that doesn't exist
    expect(() => {
      db.delete(todoItems).where(eq(todoItems.id, 99999)).run();
    }).not.toThrow();
  });
});
