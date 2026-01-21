# Web Development Essentials (Express & TypeScript)

JavaScript (and by extension TypeScript) is an incredible ecosystem for web development. Thanks to Node.js, we can run JavaScript on the server with access to hundreds of thousands of open-source libraries via npm. Need to build a web server? The Express framework is one of many options. Want to interact with a database? ORMs like TypeORM or query builders like Knex are a click away. The npm registry hosts packages for just about anything – from parsing XML and sending emails to building machine learning models with TensorFlow.js.

In this chapter, we'll build a simple to-do application using Express, TypeScript, and TypeORM. This is the same application we built with Django and Next.js, allowing you to compare the approaches and understand the unique advantages of each framework.

## Why Express?

Express is the most popular minimalist web framework for Node.js:

- **Minimal but powerful**: Provides routing and middleware, nothing more
- **Huge ecosystem**: Middleware for almost anything you need
- **Full control**: You decide how to structure your code
- **Production-proven**: Powers many high-traffic applications

## Project Setup

Create a new directory and initialize the project:

```bash
mkdir express-todo
cd express-todo
npm init -y
```

### Installing Dependencies

Install Express, TypeScript, and related packages:

```bash
npm install express ejs
npm install --save-dev typescript ts-node @types/node @types/express
```

For database operations, we'll use TypeORM with SQLite:

```bash
npm install typeorm reflect-metadata sqlite3
```

For testing:

```bash
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
```

### TypeScript Configuration

Initialize TypeScript and configure it:

```bash
npx tsc --init
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Project Structure

```
express-todo/
├── src/
│   ├── index.ts           # Express app entry point
│   ├── data-source.ts     # TypeORM database config
│   ├── models/
│   │   └── ToDoItem.ts    # Entity definition
│   ├── routes/
│   │   └── todoRoutes.ts  # Route handlers
│   ├── views/
│   │   └── todo/
│   │       ├── index.ejs  # Main template
│   │       └── partials/
│   │           ├── header.ejs
│   │           └── footer.ejs
│   ├── public/
│   │   └── style.css      # Styles
│   └── __tests__/
│       └── todo.test.ts   # Tests
├── package.json
└── tsconfig.json
```

## The MVC Pattern in Express

Express follows an MVC-like pattern:

| Layer          | Express Implementation                  |
| -------------- | --------------------------------------- |
| **Model**      | `models/ToDoItem.ts` - TypeORM Entity   |
| **View**       | `views/todo/` - EJS Templates           |
| **Controller** | `routes/todoRoutes.ts` - Route Handlers |

### Model: TypeORM Entity

Create `src/models/ToDoItem.ts`:

```typescript
/**
 * ToDoItem Entity
 *
 * TypeORM uses decorators to define entities:
 *   - @Entity(): Marks class as a database table
 *   - @PrimaryGeneratedColumn(): Auto-increment primary key
 *   - @Column(): Database column
 *   - @CreateDateColumn(): Auto-set on insert
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";

@Entity()
export class ToDoItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  text!: string;

  @CreateDateColumn()
  createdOn!: Date;

  @Column({ default: false })
  completed!: boolean;

  toString(): string {
    return this.text;
  }
}
```

### Model: Database Connection

Create `src/data-source.ts`:

```typescript
/**
 * Database Configuration
 *
 * TypeORM DataSource manages the database connection.
 * synchronize: true auto-creates tables (dev only!)
 */

import { DataSource } from "typeorm";
import { ToDoItem } from "./models/ToDoItem";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "db.sqlite",
  entities: [ToDoItem],
  synchronize: true,
  logging: false,
});
```

### Controller: Route Handlers

Create `src/routes/todoRoutes.ts`:

```typescript
/**
 * Todo Routes
 *
 * Express Router groups related routes together.
 * Each route handler receives (req, res) and returns a response.
 */

import { Router } from "express";
import { ToDoItem } from "../models/ToDoItem";

const router = Router();

// GET "/" - List all items
router.get("/", async (req, res) => {
  const items = await ToDoItem.find({ order: { createdOn: "DESC" } });
  res.render("todo/index", { items });
});

// POST "/create" - Create new item
router.post("/create", async (req, res) => {
  const text = req.body.text;
  if (!text || text.trim() === "") {
    return res.redirect("/");
  }

  const item = new ToDoItem();
  item.text = text;
  item.completed = false;
  await item.save();

  res.redirect("/");
});

// POST "/update" - Update existing item
router.post("/update", async (req, res) => {
  const id = parseInt(req.body.id);
  const item = await ToDoItem.findOneBy({ id });

  if (item) {
    item.text = req.body.text;
    // HTML checkboxes send "on" when checked, nothing when unchecked
    item.completed = req.body.completed === "on";
    await item.save();
  }

  res.redirect("/");
});

// POST "/delete" - Delete item
router.post("/delete", async (req, res) => {
  const id = parseInt(req.body.id);
  await ToDoItem.delete({ id });
  res.redirect("/");
});

export default router;
```

### View: EJS Templates

Create `src/views/todo/index.ejs`:

```ejs
<%- include('partials/header') %>

<main class="app">
  <header>
    <h1 class="app__title">Tasks</h1>
  </header>

  <form method="POST" action="/create" class="app__form">
    <input
      type="text"
      name="text"
      placeholder="New task"
      class="app__input"
      required
    />
    <button type="submit" class="app__button">Add</button>
  </form>

  <ul class="app__list">
    <% if (items.length === 0) { %>
      <li class="app__empty">No items in the list.</li>
    <% } else { %>
      <% items.forEach(item => { %>
        <li class="app__item <%= item.completed ? 'app__item--completed' : '' %>">
          <form action="/update" method="post" class="app__update-form">
            <input type="hidden" name="id" value="<%= item.id %>" />
            <label class="app__checkbox-label">
              <input
                type="checkbox"
                name="completed"
                <%= item.completed ? 'checked' : '' %>
                onchange="this.form.submit()"
              />
            </label>
            <input
              type="text"
              name="text"
              value="<%= item.text %>"
              class="app__item-input"
            />
            <button type="submit" class="app__item-btn app__item-btn--save">
              Save
            </button>
          </form>
          <form action="/delete" method="post" class="app__delete-form">
            <input type="hidden" name="id" value="<%= item.id %>" />
            <button type="submit" class="app__item-btn app__item-btn--delete">
              Delete
            </button>
          </form>
        </li>
      <% }) %>
    <% } %>
  </ul>

  <footer class="app__footer">
    <span><%= new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) %></span>
  </footer>
</main>

<%- include('partials/footer') %>
```

### Main Application

Create `src/index.ts`:

```typescript
/**
 * Express Application Entry Point
 *
 * Sets up middleware, view engine, and routes.
 * Initializes database before starting server.
 */

import "reflect-metadata";
import express from "express";
import path from "path";
import { AppDataSource } from "./data-source";
import todoRouter from "./routes/todoRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup (EJS)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Serve static files (CSS)
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", todoRouter);

// Export for testing
export default app;

// Start server
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => {
      console.log("Database initialized");
      app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
      });
    })
    .catch(console.error);
}
```

## Running the Application

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest"
  }
}
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 to see your todo app!

## Testing

Create `src/__tests__/todo.test.ts`:

```typescript
import request from "supertest";
import { AppDataSource } from "../data-source";
import { ToDoItem } from "../models/ToDoItem";
import app from "../index";

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

beforeEach(async () => {
  await ToDoItem.clear();
});

describe("ToDoItem model", () => {
  test("toString returns the text", () => {
    const item = new ToDoItem();
    item.text = "Test item";
    expect(item.toString()).toBe("Test item");
  });
});

describe("Todo endpoints", () => {
  test("GET / shows empty message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("No items in the list.");
  });

  test("POST /create adds item", async () => {
    const res = await request(app)
      .post("/create")
      .send("text=Test")
      .expect(302);

    const items = await ToDoItem.find();
    expect(items.length).toBe(1);
  });

  test("POST /update modifies item", async () => {
    const item = await ToDoItem.create({
      text: "Original",
      completed: false,
    }).save();

    await request(app)
      .post("/update")
      .send(`id=${item.id}&text=Updated&completed=on`)
      .expect(302);

    const updated = await ToDoItem.findOneBy({ id: item.id });
    expect(updated?.text).toBe("Updated");
    expect(updated?.completed).toBe(true);
  });

  test("POST /delete removes item", async () => {
    const item = await ToDoItem.create({
      text: "Delete me",
      completed: false,
    }).save();

    await request(app).post("/delete").send(`id=${item.id}`).expect(302);

    expect(await ToDoItem.findOneBy({ id: item.id })).toBeNull();
  });
});
```

Run tests:

```bash
npm test
```

## Comparison: Express vs Django vs Next.js

| Feature       | Django              | Express          | Next.js                    |
| ------------- | ------------------- | ---------------- | -------------------------- |
| **Language**  | Python              | TypeScript       | TypeScript                 |
| **Rendering** | Server templates    | EJS templates    | React Server Components    |
| **Database**  | Django ORM          | TypeORM          | Drizzle ORM                |
| **Routing**   | urls.py             | Express Router   | File-based (app/)          |
| **Forms**     | CSRF token required | Manual handling  | Server Actions (auto CSRF) |
| **Testing**   | Django TestCase     | Jest + Supertest | Jest                       |

## Key Takeaways

1. **Express is minimal** - you choose your own structure and libraries
2. **TypeORM provides Active Record** - entities can save/delete themselves
3. **EJS templates** are similar to Django templates with `<% %>` tags
4. **Middleware chain** - Express processes requests through a pipeline
5. **SuperTest** enables testing Express apps without running a server

## Next Steps

- Add CSRF protection with the `csurf` middleware
- Implement user authentication
- Add input validation with express-validator
- Deploy to a production server

---

_This tutorial is part of a series teaching the same todo application in three different frameworks:_

1. _Python + Django_
2. _TypeScript + Express (this chapter)_
3. _TypeScript + Next.js_
