# Research Notes: MVC Pattern Across Frameworks

This document summarizes key insights from web research on the MVC pattern and how it applies to Django, Express, and Next.js.

---

## 1. Traditional MVC Pattern

The **Model-View-Controller** pattern has been a cornerstone of software architecture since the 1970s:

| Component      | Responsibility                                       |
| -------------- | ---------------------------------------------------- |
| **Model**      | Data structure, business logic, database interaction |
| **View**       | User interface presentation                          |
| **Controller** | Handles user input, updates Model, selects View      |

**Key benefit:** Separation of concerns enables maintainability, scalability, and parallel development.

---

## 2. Django's MVT Variation

Django uses **MVT (Model-View-Template)**, which is MVC with different naming:

| MVC        | Django MVT | Responsibility                    |
| ---------- | ---------- | --------------------------------- |
| Model      | Model      | Database ORM, business logic      |
| View       | Template   | HTML rendering with DTL           |
| Controller | View       | Request handling, data processing |

**Django handles the "Controller" aspect** through URL routing (`urls.py`).

**Key insight:** Django's "View" functions more like a Controller in traditional MVC. The "Template" is the actual View layer.

---

## 3. Express: Flexible MVC

Express **does not enforce any architectural pattern**. Developers implement MVC manually:

- **Model:** ORMs like TypeORM, Sequelize, Mongoose
- **View:** Template engines like EJS, Pug, Handlebars
- **Controller:** Route handlers and middleware

**Key insight:** Express's unopinionated nature gives maximum flexibility but requires more architectural decision-making. This makes it ideal for APIs and microservices.

---

## 4. React Server Components: A Paradigm Shift

Next.js 13+ with the **App Router** introduces a fundamentally different approach:

### What are React Server Components (RSC)?

- Components that run **entirely on the server**
- Never shipped to the client browser
- Can directly access databases, file systems, API keys
- Send serialized HTML to the client

### How RSC Changes MVC

| Traditional MVC                         | React Server Components                            |
| --------------------------------------- | -------------------------------------------------- |
| Clear Model/View/Controller separation  | Model + Controller co-located in Server Components |
| API layer between frontend and backend  | Direct database access in components               |
| Separate codebases for frontend/backend | Unified full-stack React codebase                  |

**Key insight:** RSC shifts the separation of concerns from **layer-based** (M/V/C) to **location-based** (server vs. client). The question becomes "where does this code run?" rather than "which layer does this belong to?"

---

## 5. Server Actions: The New Controller

Next.js **Server Actions** are functions marked with `"use server"` that can be called directly from client components:

```typescript
"use server";

export async function createItem(formData: FormData) {
  const text = formData.get("text") as string;
  db.insert(todoItems).values({ text }).run();
  revalidatePath("/");
}
```

**Benefits:**

- No separate API routes needed
- Automatic CSRF protection
- Type-safe from client to server
- Progressive enhancement (works without JavaScript)

---

## 6. Performance Comparison

| Aspect                  | Django                 | Express                | Next.js (RSC)                   |
| ----------------------- | ---------------------- | ---------------------- | ------------------------------- |
| **Initial Load**        | Fast (server-rendered) | Fast (server-rendered) | Fastest (streaming)             |
| **Bundle Size**         | N/A (HTML)             | N/A (HTML)             | Smallest (server code excluded) |
| **Time to Interactive** | Moderate               | Moderate               | Fast (less JS to parse)         |
| **SEO**                 | Excellent              | Excellent              | Excellent                       |

---

## 7. When to Use Each Framework

### Django

- Data-intensive applications
- Admin interfaces needed
- Python ecosystem (ML, data science)
- Team expertise in Python

### Express

- APIs and microservices
- Real-time applications (WebSockets)
- Maximum flexibility needed
- Node.js ecosystem

### Next.js

- Dynamic, SEO-friendly UIs
- Hybrid static/server rendering
- React expertise
- Full-stack JavaScript

---

## 8. Future Directions

### React Server Components Adoption

- RSC is the **recommended approach** for Next.js 13+
- Other frameworks may adopt similar patterns
- Potential convergence of frontend/backend

### Our Potential Adoption

If migrating parts of our Vue/Vite stack to Next.js:

- Server Components could replace some API calls
- Server Actions could handle form submissions
- Better SEO for public-facing pages
- Unified TypeScript codebase

---

## Sources

1. [React Server Components Overview - spaceout.pl](https://spaceout.pl)
2. [Django MVT Architecture - GeeksforGeeks](https://geeksforgeeks.org)
3. [Express.js MVC Pattern - LogRocket](https://logrocket.com)
4. [Next.js App Router - Next.js Docs](https://nextjs.org/docs)
5. [Comparison of Web Frameworks - nomadicsoft.io](https://nomadicsoft.io)
