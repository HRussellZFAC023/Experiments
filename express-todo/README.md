# Express Todo App

A minimalist todo application built with Express, TypeScript, and TypeORM.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Stack

- **Express** - Web framework
- **TypeScript** - Type safety
- **TypeORM** - Database ORM
- **SQLite** - Database
- **EJS** - Templating
- **Jest** - Testing

## Commands

| Command         | Description          |
| --------------- | -------------------- |
| `npm run dev`   | Start dev server     |
| `npm test`      | Run tests            |
| `npm run build` | Compile TypeScript   |
| `npm start`     | Run compiled version |

## Project Structure

```
src/
├── index.ts           # App entry point
├── data-source.ts     # Database config
├── models/            # TypeORM entities
├── routes/            # Express routes
├── views/             # EJS templates
├── public/            # Static files
└── __tests__/         # Tests
```

## Tutorial

See [TUTORIAL.md](./TUTORIAL.md) for a step-by-step guide.

---

_Part of a three-framework comparison: [Django](../django-todo) | [Express](../express-todo) | [Next.js](../nextjs-todo)_
