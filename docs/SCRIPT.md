# Lightning Talk Script: MVC Pattern - 3 Frameworks, 1 App

**Duration:** ~10-15 minutes (with demo)
**Presenter:** Henry Russell
**Date:** Week of Jan 27, 2026

---

## 0. Setup (Before Talk)

Open these terminals **before** you start:

```bash
# Terminal 1: Django
cd ~/Documents/Experiments/django-todo
source .venv/bin/activate
python manage.py runserver  # http://localhost:8000

# Terminal 2: Express
cd ~/Documents/Experiments/express-todo
npm run dev  # http://localhost:3000

# Terminal 3: Next.js
cd ~/Documents/Experiments/nextjs-todo
npm run dev  # http://localhost:3001 (or stop Express first)
```

Have these browser tabs ready:

- http://localhost:8000 (Django)
- http://localhost:3000 (Express)
- https://hrussellzfac023.github.io/Experiments/ (Slides)

---

## 1. Introduction (1 min)

**[SLIDE: Title]**

> "Hey everyone! Today I'm going to talk about the MVC pattern by showing you **the same todo app** built in three different frameworks: **Django**, **Express**, and **Next.js**."

> "The goal was to understand how different frameworks implement the same architecture and see what we can learn from comparing them."

---

## 2. Why Build the Same App 3 Times? (1 min)

**[SLIDE: "The Experiment"]**

> "So why would anyone build the same app three times?"

- **Django** → Python's batteries-included framework
- **Express** → Node.js minimal framework
- **Next.js** → React with Server Components

> "Each framework has a different philosophy, but they all solve the same problem. By building the same CRUD app, we can see the patterns that stay the same and what's unique to each."

---

## 3. What is MVC? (1 min)

**[SLIDE: "What is MVC?"]**

> "MVC stands for Model-View-Controller. It's been around since the 70s and it's still everywhere."

- **Model** → Data structure & database
- **View** → What the user sees
- **Controller** → Handles requests & logic

> "Django calls it MTV - Model-Template-View - but it's the same idea. The 'View' in Django is like a Controller, and the 'Template' is like a View."

---

## 4. Quick Demo: The App (2 min)

**[LIVE DEMO - Switch to browser]**

> "Let me show you the app quickly. All three look identical because they share the same CSS."

**Demo steps:**

1. Show Django app (http://localhost:8000)
   - Add a task: "Buy groceries"
   - Mark it complete (checkbox)
   - Edit the text
   - Delete it
2. Switch to Express (http://localhost:3000)
   - "Same app, different framework"
3. Mention Next.js runs on 3001

---

## 5. Comparing the Model Layer (2 min)

**[SLIDE: "Django Model"]**

> "Let's look at the Model layer. Here's Django:"

```python
class ToDoItem(models.Model):
    text = models.CharField(max_length=255)
    created_on = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
```

> "Django ORM is really clean. You define your model and it **generates migrations automatically**."

**[SLIDE: "Express Model"]**

```typescript
@Entity()
export class ToDoItem extends BaseEntity {
  @Column({ length: 100 })
  text!: string;

  @CreateDateColumn()
  createdOn!: Date;

  @Column({ default: false })
  completed!: boolean;
}
```

> "Express uses TypeORM with **decorators**. It's the Active Record pattern - the entity can save itself with `item.save()`."

**[SLIDE: "Next.js Model"]**

```typescript
export const todoItems = sqliteTable("todo_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false),
});
```

> "Next.js uses Drizzle ORM. No decorators, just functions. Type-safe queries at compile time."

---

## 6. Comparing Controllers (2 min)

**[SLIDE: "Django Controller"]**

> "Now the controller layer. In Django, views.py handles requests:"

```python
def create(request):
    text = request.POST.get("text", "").strip()
    if text:
        ToDoItem.objects.create(text=text, completed=False)
    return redirect("todo:list")
```

**[SLIDE: "Express Controller"]**

```typescript
router.post("/create", async (req, res) => {
  const item = new ToDoItem();
  item.text = req.body.text;
  await item.save();
  res.redirect("/");
});
```

**[SLIDE: "Next.js Controller"]**

```typescript
"use server";

export async function createItem(formData: FormData) {
  const text = formData.get("text") as string;
  db.insert(todoItems).values({ text: text.trim() }).run();
  revalidatePath("/");
}
```

> "This is a **Server Action**. No API routes needed! You call it directly from the form and it runs on the server. This is the big shift in React Server Components."

---

## 7. The Checkbox Gotcha 🤯 (1 min)

**[SLIDE: "Fun Fact: Checkboxes"]**

> "Here's something that caught me in all three frameworks. HTML checkboxes send `"on"` when checked... **and nothing when unchecked!**"

```python
# Django
completed = request.POST.get("completed") == "on"
```

```typescript
// Express & Next.js
const completed = formData.get("completed") === "on";
```

> "Same gotcha, same fix, in all three frameworks. It's the kind of thing you only learn by building."

---

## 8. Comparing Views / Templates (1 min)

**[SLIDE: "Views: Template Syntax"]**

> "Quick comparison of template syntax:"

| Django                    | Express                    | Next.js            |
| ------------------------- | -------------------------- | ------------------ |
| `{{ item.text }}`         | `<%= item.text %>`         | `{item.text}`      |
| `{% for item in items %}` | `<% items.forEach(...) %>` | `{items.map(...)}` |

> "Different syntax, same job. Django and Express use server templates. Next.js uses React components that can also run on the server."

---

## 9. Key Takeaways (1 min)

**[SLIDE: "Key Takeaways"]**

1. **MVC is universal** - Same pattern, different syntax
2. **Django is batteries-included** - ORM, admin, auth built-in
3. **Express is minimal** - You choose everything
4. **Next.js is the future?** - Server Components = no API routes
5. **Project structure matters** - Django enforces it, others don't

---

## 10. How This Applies to Our Work (2 min)

**[SLIDE: "Why This Matters"]**

> "So how does this link to what we do at Co-op?"

### 1. Next.js Migration Potential

> "We've talked about potentially moving to Next.js. The App Router and Server Actions could simplify our frontend-backend communication significantly."

**Similarity to our codebase:**

```
coopeng/funeralcare/customer/
├── fnc-components/         # Shared component library
├── fnc-direct-cremation/   # Vue + Vite app
└── fnc-finder-api/         # API service
```

> "Our current structure with `fnc-components` is like having Views/Components separated from Controllers. Next.js Server Components would let us co-locate data fetching with the component that needs it."

### 2. Testing Patterns

> "I recently converted `fnc-components` from Cypress to Playwright. All three todo apps have tests too:"

| Todo App | Test Tool                     |
| -------- | ----------------------------- |
| Django   | `python manage.py test`       |
| Express  | `npm test` (Jest + SuperTest) |
| Next.js  | `npm test` (Jest)             |

> "The pattern is the same: mock the database, simulate HTTP requests, assert on results. The Playwright move gives us similar benefits - faster, more reliable tests."

### 3. Vite vs Next.js

> "Our apps like `fnc-direct-cremation` use Vite. Next.js is similar but includes SSR/SSG out of the box. If we ever need SEO or faster initial loads, that's a consideration."

---

## 11. Resources (30 sec)

**[SLIDE: "Resources"]**

> "All the code is on GitHub. Each folder has a TUTORIAL.md with a full walkthrough."

**Links:**

- **GitHub:** [github.com/HRussellZFAC023/Experiments](https://github.com/HRussellZFAC023/Experiments)
- **Slides:** [hrussellzfac023.github.io/Experiments](https://hrussellzfac023.github.io/Experiments/)
- **Inspiration:** [diegojancic.com/blog/serverless-python-aws-lambda-book](https://diegojancic.com/blog/serverless-python-aws-lambda-book)

---

## 12. Questions

**[SLIDE: "Questions?"]**

> "Any questions?"

---

## Appendix: Commands Reference

### Django

```bash
# Setup
python -m venv .venv
source .venv/bin/activate
pip install django
python manage.py migrate

# Run
python manage.py runserver

# Test
python manage.py test
```

### Express

```bash
# Setup
npm install

# Run
npm run dev

# Test
npm test

# Files worth showing
src/models/ToDoItem.ts       # TypeORM Entity
src/routes/todoRoutes.ts     # Express Router
src/views/todo/index.ejs     # EJS Template
```

### Next.js

```bash
# Setup
npm install

# Run
npm run dev

# Test
npm test

# Files worth showing
src/db/schema.ts             # Drizzle Schema
src/app/actions.ts           # Server Actions
src/app/page.tsx             # React Server Component
```

---

## Appendix: Key Differences Summary

| Aspect                | Django                | Express           | Next.js           |
| --------------------- | --------------------- | ----------------- | ----------------- |
| **Language**          | Python                | TypeScript        | TypeScript        |
| **ORM**               | Django ORM            | TypeORM           | Drizzle           |
| **View Engine**       | Django Templates      | EJS               | React Components  |
| **Routing**           | urls.py               | Express Router    | File-based (app/) |
| **CSRF**              | `{% csrf_token %}`    | Manual / csurf    | Automatic         |
| **Testing**           | TestCase              | Jest + SuperTest  | Jest              |
| **Project Structure** | Enforced by framework | You decide        | Enforced (app/)   |
| **Philosophy**        | Batteries-included    | Minimal, flexible | Full-stack React  |

---

## Appendix: Next.js App Directory Explained

The "app directory" in Next.js 13+ is a new routing paradigm:

```
app/
├── layout.tsx      # Shared layout (wraps all pages)
├── page.tsx        # Home page (/)
├── actions.ts      # Server Actions (controllers)
└── todos/
    └── page.tsx    # /todos route
```

**Key Features:**

- **File-based routing:** `app/about/page.tsx` → `/about`
- **Server Components by default:** Components run on the server unless you add `"use client"`
- **Server Actions:** Functions marked with `"use server"` can be called from forms
- **Automatic code splitting:** Only the code needed for the current page is sent to the browser

This is the **recommended** way to build Next.js apps in 2024+.

---

## Appendix: Relevant Links to Our Codebase

### Testing Comparison

Our `fnc-components` now uses Playwright, similar to how we test the todo apps:

```
coopeng/funeralcare/customer/fnc-components/
├── playwright.config.ts   # Playwright config
├── tests/                 # E2E tests
└── vitest.config.ts       # Unit tests (like Jest)
```

### Component Structure

Our shared components library follows a similar pattern to Next.js components:

```
fnc-components/src/
├── components/            # Reusable Vue components
├── composables/           # Shared logic (like React hooks)
└── utils/                 # Helper functions
```

**Improvement opportunity:** If we move to Next.js, our composables could become Server Actions for data fetching directly in components.

### API Pattern Comparison

Our `fnc-finder-api` is a separate backend, which is common with Express. Next.js allows API routes inside the same project, reducing the need for separate services in some cases.
