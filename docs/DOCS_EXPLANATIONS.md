# Documentation & Research Insights

This document aggregates the detailed explanations added to the codebase and provides broader context on the architectural differences between Django (classic MVC) and Next.js App Router (React Server Components).

## 1. Architectural Comparison

| Feature        | Django (Classic MVC)        | Next.js App Router (RSC)                    |
| :------------- | :-------------------------- | :------------------------------------------ |
| **Model**      | Django ORM (`models.py`)    | Drizzle ORM (`lib/schema.ts` + `lib/db.ts`) |
| **View**       | Templates (`.html`)         | React Server Components (`page.tsx`)        |
| **Controller** | View Functions (`views.py`) | Server Actions (`actions.ts`)               |
| **Routing**    | `urls.py`                   | File-system routing (`app/page.tsx`)        |
| **State**      | Server-side Session         | Server-side + Client-side (when needed)     |

### Key Insight: The "Controller" Shift

In Django, the **View Function** acts as the controller—it receives the request, talks to the DB, and renders a template.
In Next.js, **Server Actions** have taken over this role for mutations. They receive `FormData`, talk to the DB, and trigger a re-render. The "View" (Server Component) fetches its own data directly, removing the need for a controller to "pass" data to it.

## 2. Deep Dive: React Server Components (RSC) vs MVC

Research indicates a paradigm shift in how we think about the "View":

- **Django**: The View (Template) is _passive_. It waits for data from the Controller (View Function).
- **Next.js RSC**: The View (Server Component) is _active_. It is an async function that fetches its own data directly from the DB.

> "Server Components allow the server to do the heavy lifting of data fetching and rendering, streaming the result to the client as HTML. This reduces the JavaScript bundle size and improves initial page load performance."

## 3. Implementation Details & Comments

We have added extensive inline documentation to the following files to explain these patterns in situ:

### Django

- [`django-todo/todo/models.py`](../django-todo/todo/models.py): Explains `models.Model`, fields, and the ORM.
- [`django-todo/todo/views.py`](../django-todo/todo/views.py): Explains the Request-Response cycle, `render()`, and form handling.

### Next.js

- [`nextjs-todo/src/app/actions.ts`](../nextjs-todo/src/app/actions.ts): Explains Server Actions, `revalidatePath`, and `FormData` handling.
- [`nextjs-todo/src/app/page.tsx`](../nextjs-todo/src/app/page.tsx): Explains Server Components, metadata, and progressive enhancement.

## 4. Connections to `coopeng` Codebase

The following patterns in our experiments are directly relevant to the `/Users/heru/Documents/coopeng` codebase:

### a. Checkbox Handling Pattern

**Current State**: In `fnc-direct-cremation` (Vue), form handling often requires manual payload construction.
**Insight**: Both Django and Express rely on the native HTML behavior where unchecked boxes send _nothing_.
**Recommendation**: Adopt a consistent utility in the Vue client to mimic this standard browser behavior, normalizing boolean inputs before sending to the API.

### b. Server Actions for "Controllers"

**Current State**: `fnc-components` likely uses generic API endpoints.
**Insight**: The "Server Action" pattern (remote functions callable from the client) is becoming popular even outside React (e.g., via RPC libraries).
**Recommendation**: When refactoring API layers, consider grouping endpoints by "Feature" (like a Controller class) rather than just HTTP verbs, similar to how `actions.ts` groups all Todo mutations.

## 5. Research Citations

1.  **Django MVC vs MVT**: Django's documentation clarifies that it is technically an "MVT" framework, where the Template is the View and the View is the Controller.
2.  **Next.js Server Actions**: Introduced to simplify data mutations and reduce the need for separate API routes. They automatically handle CSRF and progressive enhancement.
3.  **Post/Redirect/Get (PRG)**: Both our Django and Express implementations strictly follow the PRG pattern to prevent double-submissions, a best practice for all web forms.
