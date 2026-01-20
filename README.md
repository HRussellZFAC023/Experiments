# Todo Apps - Three Frameworks Comparison

A lightning talk demonstrating the same todo application built with three different web frameworks.

## The Apps

| App                            | Framework | Language   | Port |
| ------------------------------ | --------- | ---------- | ---- |
| [django-todo](./django-todo)   | Django    | Python     | 8000 |
| [express-todo](./express-todo) | Express   | TypeScript | 3000 |
| [nextjs-todo](./nextjs-todo)   | Next.js   | TypeScript | 3000 |

## Features

All three apps share:

- ✅ **Same functionality** - Create, read, update, delete todos
- ✅ **Same styling** - Minimalist design with Inter font
- ✅ **Same architecture** - MVC pattern
- ✅ **Same tests** - CRUD endpoint tests

## Quick Comparison

| Feature   | Django     | Express    | Next.js                 |
| --------- | ---------- | ---------- | ----------------------- |
| Language  | Python     | TypeScript | TypeScript              |
| Rendering | Templates  | EJS        | React Server Components |
| Database  | Django ORM | TypeORM    | Drizzle ORM             |
| CSRF      | Built-in   | Manual     | Automatic               |

## Running

Each app has its own setup instructions in its README.

## Documentation

Each app includes a detailed TUTORIAL.md following the same structure for easy comparison.
