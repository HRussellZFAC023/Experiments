# Web Development Essentials (Next.js & React Server Components)

Next.js is a powerful React framework that enables you to build full-stack web applications with ease. With the introduction of the App Router and React Server Components in Next.js 13+, the framework has evolved to provide an even more streamlined development experience that blurs the line between frontend and backend.

In this chapter, we'll build a simple to-do application using Next.js 15, React Server Components, and Server Actions. This is the same application we built with Django and Express, allowing you to compare the approaches and understand the unique advantages of each framework.

## What are React Server Components?

React Server Components (RSC) represent a paradigm shift in how we build React applications:

- **Server-only rendering**: Components render exclusively on the server
- **Zero client-side JavaScript**: RSC don't ship any JavaScript to the browser
- **Direct backend access**: You can query databases directly in your components
- **Async components**: Components can be async functions that await data

This is fundamentally different from traditional React where all components run on the client and require API calls to fetch data.

## What are Server Actions?

Server Actions are functions that run on the server but can be called from client code:

- **No API routes needed**: Replace REST endpoints with simple function calls
- **Built-in CSRF protection**: Next.js handles security automatically
- **Form integration**: Works seamlessly with HTML forms
- **Type safety**: Full TypeScript support end-to-end

## Project Setup

Let's create our Next.js project. Open your terminal and run:

```bash
npx create-next-app@latest nextjs-todo --typescript --app --src-dir --use-npm --empty
cd nextjs-todo
```

This creates a new Next.js project with:

- TypeScript support (`--typescript`)
- App Router (`--app`)
- Source directory structure (`--src-dir`)
- npm as package manager (`--use-npm`)
- Empty project template (`--empty`)

### Installing Dependencies

We'll use Drizzle ORM with SQLite for our database. Install the dependencies:

```bash
npm install better-sqlite3 drizzle-orm
npm install --save-dev drizzle-kit @types/better-sqlite3
```

### Project Structure

After setup, your project structure should look like this:

```
nextjs-todo/
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Root layout (HTML structure)
│   │   ├── page.tsx      # Home page component
│   │   ├── actions.ts    # Server Actions
│   │   └── globals.css   # Global styles
│   ├── lib/
│   │   ├── db.ts         # Database connection
│   │   └── schema.ts     # Database schema
│   └── __tests__/
│       └── todo.test.ts  # Tests
├── data/
│   └── database.db       # SQLite database
├── package.json
└── tsconfig.json
```

## The MVC Pattern in Next.js

Next.js App Router follows an MVC-like pattern:

| Layer          | Next.js Implementation                             |
| -------------- | -------------------------------------------------- |
| **Model**      | `lib/schema.ts` - Database schema with Drizzle ORM |
| **View**       | `app/page.tsx` - React Server Components           |
| **Controller** | `app/actions.ts` - Server Actions                  |

### Model: Database Schema

Create `src/lib/schema.ts`:

```typescript
/**
 * Database Schema (Drizzle ORM)
 *
 * Drizzle uses decorators and builder functions to define schemas:
 *   - sqliteTable(): Creates a table definition
 *   - integer(), text(): Column type functions
 *   - primaryKey(), notNull(), default(): Constraints
 */

import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const todoItems = sqliteTable("todo_items", {
  // Primary key - auto-incrementing integer
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Task description - required string
  text: text("text").notNull(),

  // Creation timestamp - auto-set on insert
  createdOn: text("created_on")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),

  // Completion status - defaults to false
  // SQLite uses integer (0/1) for booleans
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
});

// Type inference for SELECT results
export type ToDoItem = typeof todoItems.$inferSelect;

// Type inference for INSERT data
export type NewToDoItem = typeof todoItems.$inferInsert;
```

### Model: Database Connection

Create `src/lib/db.ts`:

```typescript
/**
 * Database Connection
 *
 * We use better-sqlite3, a synchronous SQLite driver.
 * Drizzle wraps it to provide type-safe queries.
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Database file path
const DB_PATH = "./data/database.db";

// Initialize SQLite connection
const sqlite = new Database(DB_PATH);

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL"); // wal = write ahead logging this means that the database is written to a temporary file first and then the temporary file is copied to the main database file.

// Create table if it doesn't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS todo_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_on TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
  )
`);

// Export Drizzle client
export const db = drizzle(sqlite, { schema });
```

Don't forget to create the data directory:

```bash
mkdir -p data
```

### Controller: Server Actions

Create `src/app/actions.ts`:

```typescript
/**
 * Server Actions
 *
 * These functions run on the server but can be called from components.
 * They replace traditional API routes for form handling.
 *
 * Key features:
 *   - "use server" directive marks functions as server-only
 *   - Receive FormData when used as form actions
 *   - Call revalidatePath() to refresh page after mutations
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { todoItems } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Get all todo items, newest first.
 */
export async function getItems() {
  return db.select().from(todoItems).orderBy(desc(todoItems.createdOn)).all();
}

/**
 * Create a new todo item.
 *
 * @param formData - Form data containing 'text' field
 */
export async function createItem(formData: FormData) {
  const text = formData.get("text") as string;

  if (!text || text.trim() === "") {
    return;
  }

  db.insert(todoItems).values({ text: text.trim() }).run();
  revalidatePath("/");
}

/**
 * Update an existing todo item.
 *
 * @param formData - Form data containing 'id', 'text', and optionally 'completed'
 *
 * IMPORTANT - Checkbox Handling:
 *   HTML checkboxes do NOT send any value when unchecked.
 *   We detect this by checking: formData.get("completed") === "on"
 */
export async function updateItem(formData: FormData) {
  const id = Number(formData.get("id"));
  const text = (formData.get("text") as string)?.trim() || "";
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
 * @param formData - Form data containing 'id'
 */
export async function deleteItem(formData: FormData) {
  const id = Number(formData.get("id"));
  db.delete(todoItems).where(eq(todoItems.id, id)).run();
  revalidatePath("/");
}
```

### View: React Server Component

Create `src/app/page.tsx`:

```typescript
/**
 * Home Page - React Server Component
 *
 * This component is a Server Component by default:
 *   - Renders on the server only
 *   - Can be an async function
 *   - Can directly query the database
 *   - Sends only HTML to the client (zero JS)
 *   - Cannot use hooks (useState, useEffect)
 *
 * Forms use Server Actions for data mutations.
 * No JavaScript needed on the client for form submission!
 */

import { getItems, createItem, updateItem, deleteItem } from "./actions";

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function HomePage() {
  // Direct database query in Server Component
  const items = await getItems();

  return (
    <main className="app">
      <header>
        <h1 className="app__title">Tasks</h1>
      </header>

      {/* Create Form - action points to Server Action */}
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
                  <input
                    type="checkbox"
                    name="completed"
                    value="on"
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

      <footer className="app__footer">
        <span>{formatDate()}</span>
      </footer>
    </main>
  );
}
```

### Layout: Root Layout

Create `src/app/layout.tsx`:

```typescript
/**
 * Root Layout
 *
 * Layouts in Next.js App Router:
 *   - Wrap all pages in the same directory
 *   - Persist across navigations
 *   - Must define <html> and <body> tags
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tasks | Next.js Todo App",
  description: "A minimalist todo application built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US">
      <body>{children}</body>
    </html>
  );
}
```

### Styles: Global CSS

Create `src/app/globals.css` with the same minimalist styles we used in Django and Express.

## Running the Application

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 to see your todo app!

## Testing

Testing React Server Components and Server Actions requires a different approach than traditional React testing. We focus on:

1. **Database operations** (unit tests)
2. **Server Action logic** (integration tests)

Install testing dependencies:

```bash
npm install --save-dev jest ts-jest @types/jest
```

Create `jest.config.js`:

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

Create `src/__tests__/todo.test.ts`:

```typescript
import { db } from "@/lib/db";
import { todoItems } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

beforeEach(() => {
  db.delete(todoItems).run();
});

describe("TodoItems Database Operations", () => {
  test("should insert a new item", () => {
    db.insert(todoItems).values({ text: "Test item" }).run();

    const items = db.select().from(todoItems).all();

    expect(items.length).toBe(1);
    expect(items[0]?.text).toBe("Test item");
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

    expect(db.select().from(todoItems).all().length).toBe(0);
  });
});
```

Run tests:

```bash
npm test
```

## Comparison: Next.js vs Django vs Express

| Feature       | Django              | Express                | Next.js                    |
| ------------- | ------------------- | ---------------------- | -------------------------- |
| **Language**  | Python              | TypeScript             | TypeScript                 |
| **Rendering** | Server templates    | Server templates (EJS) | React Server Components    |
| **Database**  | Django ORM          | TypeORM                | Drizzle ORM                |
| **Routing**   | urls.py             | Express Router         | File-based (app/)          |
| **Forms**     | CSRF token required | Manual handling        | Server Actions (auto CSRF) |
| **Testing**   | Django TestCase     | Jest + Supertest       | Jest                       |

## Key Takeaways

1. **React Server Components** eliminate the need for separate API routes for data fetching
2. **Server Actions** provide a clean way to handle form submissions without API routes
3. **Type safety** is end-to-end with TypeScript and Drizzle
4. **Progressive enhancement** - forms work without JavaScript
5. **Zero client JS** for Server Components means faster initial page loads

## Next Steps

- Add authentication with NextAuth.js
- Implement optimistic updates with useOptimistic
- Add client-side interactivity with Client Components
- Deploy to Vercel

---

_This tutorial is part of a series teaching the same todo application in three different frameworks:_

1. _Python + Django_
2. _TypeScript + Express_
3. _TypeScript + Next.js (this chapter)_
