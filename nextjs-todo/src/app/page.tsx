/**
 * Home Page - Todo List
 * =====================
 *
 * This is the main page component that displays the todo list.
 *
 * Next.js MVC Pattern - The "V" (View)
 * ------------------------------------
 * In Next.js App Router architecture:
 *   - **Model**: Database schema and queries (lib/schema.ts, lib/db.ts)
 *   - **Controller**: Server Actions (app/actions.ts)
 *   - **View**: React Server Components (THIS FILE)
 *
 * React Server Components (RSC)
 * -----------------------------
 * This component is a Server Component by default (no "use client" directive).
 * Server Components:
 *   - Render on the server only
 *   - Can be async functions
 *   - Can directly access backend resources (database, file system)
 *   - Send only HTML to the client (no JavaScript for this component)
 *   - Cannot use hooks (useState, useEffect, etc.)
 *   - Cannot use browser APIs or event handlers
 *
 * Server vs Client Components
 * ---------------------------
 * | Feature              | Server Component     | Client Component     |
 * |---------------------|---------------------|---------------------|
 * | Directive           | (none - default)     | "use client"         |
 * | Rendering           | Server only          | Server + Client      |
 * | Data fetching       | Direct async/await   | useEffect + fetch    |
 * | useState/useEffect  | ❌ Cannot use        | ✅ Can use           |
 * | Event handlers      | ❌ No onClick, etc.  | ✅ Can use           |
 * | Bundle size         | Zero JS sent         | JS sent to client    |
 * | SEO                 | Fully indexable      | May need SSR         |
 *
 * Form Actions in Server Components
 * ---------------------------------
 * Although Server Components can't use onClick, they CAN use form actions.
 * The form's action attribute can reference a Server Action:
 *
 *   <form action={createItem}>
 *     <input name="text" />
 *     <button type="submit">Add</button>
 *   </form>
 *
 * When submitted, the browser:
 *   1. Serializes form data
 *   2. Sends POST request to Next.js server
 *   3. Next.js calls the Server Action with FormData
 *   4. Server Action performs database operation
 *   5. Server Action calls revalidatePath() to refresh
 *   6. Page re-renders with new data
 *
 * No JavaScript needed on the client for this flow!
 *
 * Progressive Enhancement
 * -----------------------
 * Forms work even with JavaScript disabled because they use
 * standard HTML form submission under the hood.
 */

import { getItems, createItem, updateItem, deleteItem } from "./actions";
import { AutoSubmitCheckbox } from "./components/AutoSubmitCheckbox";

/**
 * Format date for display in footer.
 * Returns format like "Jan 12"
 */
function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Home Page Component
 *
 * Async Server Component that:
 *   1. Fetches todo items from database
 *   2. Renders the list with forms for CRUD operations
 *
 * All forms use Server Actions for data mutations.
 */
export default async function HomePage() {
  // Direct database query in Server Component
  const items = await getItems();

  return (
    <main className="app">
      {/* Header */}
      <header>
        <h1 className="app__title">Tasks</h1>
      </header>

      {/* Create Form */}
      <form action={createItem} className="app__form">
        <input
          type="text"
          name="text"
          placeholder="New task"
          className="app__input"
          required
        />
        <button type="submit" className="app__button">
          Add
        </button>
      </form>

      {/* Todo List */}
      <ul className="app__list">
        {items.length === 0 ? (
          <li className="app__empty">No items in the list.</li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className={`app__item ${
                item.completed ? "app__item--completed" : ""
              }`}
            >
              {/* Update Form */}
              <form action={updateItem} className="app__update-form">
                <input type="hidden" name="id" value={item.id} />

                <label className="app__checkbox-label">
                  <AutoSubmitCheckbox
                    name="completed"
                    defaultChecked={item.completed}
                  />
                </label>

                <input
                  type="text"
                  name="text"
                  defaultValue={item.text}
                  className="app__item-input"
                />

                <button
                  type="submit"
                  className="app__item-btn app__item-btn--save"
                >
                  Save
                </button>
              </form>

              {/* Delete Form */}
              <form action={deleteItem} className="app__delete-form">
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className="app__item-btn app__item-btn--delete"
                >
                  Delete
                </button>
              </form>
            </li>
          ))
        )}
      </ul>

      {/* Footer */}
      <footer className="app__footer">
        <span>{formatDate()}</span>
      </footer>
    </main>
  );
}
