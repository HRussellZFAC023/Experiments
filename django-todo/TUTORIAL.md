# Web Development Essentials (Django & Python)

Python is an incredible language. Because of its extensive use in academia, it's possible to find very useful open-source and free libraries. From Numpy and Pandas for data analysis to TensorFlow for machine learning, Python has it all. For web development, Django provides a batteries-included framework that makes building web applications straightforward.

In this chapter, we'll build a simple to-do application using Django. This is the same application we build with Express and Next.js, allowing you to compare the approaches and understand the unique advantages of each framework.

## Why Django?

Django is a powerful, full-featured web framework:

- **Batteries included**: ORM, admin, auth, and more out of the box
- **Convention over configuration**: Sensible defaults get you started fast
- **Excellent documentation**: One of the best documented frameworks
- **Large community**: Extensive ecosystem of reusable apps

## Project Setup

Create a virtual environment and install Django:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install django
```

Create the project:

```bash
django-admin startproject website .
```

This creates:

```
django-todo/
├── manage.py           # Django CLI
├── website/
│   ├── __init__.py
│   ├── settings.py     # Project settings
│   ├── urls.py         # Root URL config
│   ├── asgi.py
│   └── wsgi.py
```

### Create the Todo App

```bash
python manage.py startapp todo
```

Register it in `website/settings.py`:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'todo',  # Add this
]
```

## The MVC Pattern in Django

Django follows an MTV (Model-Template-View) pattern, which is MVC with different names:

| Layer        | Django Implementation                         |
| ------------ | --------------------------------------------- |
| **Model**    | `models.py` - Database models with Django ORM |
| **Template** | `templates/` - HTML templates                 |
| **View**     | `views.py` - Request handlers (controllers)   |

### Model: Django ORM

Create `todo/models.py`:

```python
"""
ToDoItem Model

Django models define both the data structure AND the database schema.
The ORM handles all SQL generation automatically.

Key concepts:
  - CharField: String with max length
  - DateTimeField: Timestamp
  - BooleanField: True/False
  - auto_now_add: Set on creation
"""

from django.db import models


class ToDoItem(models.Model):
    text = models.CharField(max_length=255)
    created_on = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.text
```

Create and run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

### View: Request Handlers

Create `todo/views.py`:

```python
"""
Todo Views

Django views are functions (or classes) that:
  - Receive an HTTP request
  - Process data
  - Return an HTTP response

Common patterns:
  - render(): Return HTML template
  - redirect(): Redirect to another URL
  - request.POST: Form data dictionary
"""

from django.shortcuts import redirect, render
from django.http import HttpRequest, HttpResponse

from todo.models import ToDoItem


def index(request: HttpRequest) -> HttpResponse:
    """List all todo items, newest first."""
    items = ToDoItem.objects.order_by("-created_on")
    context = {"items": items}
    return render(request, "todo/index.html", context)


def create(request: HttpRequest) -> HttpResponse:
    """Create a new todo item from POST data."""
    text = request.POST.get("text", "").strip()
    if text:
        ToDoItem.objects.create(text=text, completed=False)
    return redirect("todo:list")


def update(request: HttpRequest) -> HttpResponse:
    """Update an existing todo item."""
    item_id = request.POST.get("id")
    text = request.POST.get("text", "").strip()
    # HTML checkbox: sends "on" when checked, nothing when unchecked
    completed = request.POST.get("completed") == "on"

    ToDoItem.objects.filter(pk=item_id).update(text=text, completed=completed)
    return redirect("todo:list")


def delete(request: HttpRequest) -> HttpResponse:
    """Delete a todo item."""
    item_id = request.POST.get("id")
    ToDoItem.objects.filter(pk=item_id).delete()
    return redirect("todo:list")
```

### URLs: Routing Configuration

Create `todo/urls.py`:

```python
"""
Todo URL Configuration

Django uses explicit URL patterns.
Each pattern maps a path to a view function.

The 'name' parameter enables reverse URL lookups:
  {% url 'todo:list' %} in templates
  reverse('todo:list') in Python
"""

from django.urls import path

from todo.views import create, delete, index, update

app_name = "todo"

urlpatterns = [
    path("", index, name="list"),
    path("create", create, name="create"),
    path("update", update, name="update"),
    path("delete", delete, name="delete"),
]
```

Include in `website/urls.py`:

```python
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("todo.urls")),
]
```

### Templates: HTML Views

Create `todo/templates/todo/base.html`:

```html
{% load static %}
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="UTF-8" />
    <title>To-Do Items</title>
    <link rel="stylesheet" href="{% static 'todo/style.css' %}" />
  </head>
  <body>
    {% block content %}{% endblock %}
  </body>
</html>
```

Create `todo/templates/todo/index.html`:

```html
{% extends "todo/base.html" %} {% block content %}
<main class="app">
  <header>
    <h1 class="app__title">Tasks</h1>
  </header>

  <form method="POST" action="{% url 'todo:create' %}" class="app__form">
    {% csrf_token %}
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
    {% for item in items %}
    <li
      class="app__item {% if item.completed %}app__item--completed{% endif %}"
    >
      <form
        action="{% url 'todo:update' %}"
        method="post"
        class="app__update-form"
      >
        {% csrf_token %}
        <input type="hidden" name="id" value="{{ item.pk }}" />
        <label class="app__checkbox-label">
          <input
            type="checkbox"
            name="completed"
            {%
            if
            item.completed
            %}checked{%
            endif
            %}
            onchange="this.form.submit()"
          />
        </label>
        <input
          type="text"
          name="text"
          value="{{ item.text }}"
          class="app__item-input"
        />
        <button type="submit" class="app__item-btn app__item-btn--save">
          Save
        </button>
      </form>
      <form
        action="{% url 'todo:delete' %}"
        method="post"
        class="app__delete-form"
      >
        {% csrf_token %}
        <input type="hidden" name="id" value="{{ item.pk }}" />
        <button type="submit" class="app__item-btn app__item-btn--delete">
          Delete
        </button>
      </form>
    </li>
    {% empty %}
    <li class="app__empty">No items in the list.</li>
    {% endfor %}
  </ul>

  <footer class="app__footer">
    <span>{% now "M j" %}</span>
  </footer>
</main>
{% endblock %}
```

### Static Files: CSS

Create `todo/static/todo/style.css` with the shared minimalist styles.

## Running the Application

Start the development server:

```bash
python manage.py runserver
```

Open http://localhost:8000 to see your todo app!

## Testing

Django has built-in testing support. Create `todo/tests.py`:

```python
"""
Todo Tests

Django's TestCase:
  - Creates a fresh test database
  - Provides self.client for HTTP simulation
  - Rolls back after each test
"""

from django.test import TestCase
from django.urls import reverse

from todo.models import ToDoItem


class TodoModelTestCase(TestCase):
    def test_str(self):
        """Test the string representation."""
        item = ToDoItem(text="Test item", completed=True)
        self.assertEqual(str(item), "Test item")


class TodoViewsTestCase(TestCase):
    def test_list_view_empty(self):
        """Test list view with no items."""
        url = reverse("todo:list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No items in the list.")

    def test_create_view(self):
        """Test creating a new item."""
        url = reverse("todo:create")
        response = self.client.post(url, {"text": "New item"})

        self.assertRedirects(response, reverse("todo:list"))
        self.assertEqual(ToDoItem.objects.count(), 1)
        self.assertEqual(ToDoItem.objects.first().text, "New item")

    def test_update_view(self):
        """Test updating an existing item."""
        item = ToDoItem.objects.create(text="Original", completed=False)

        url = reverse("todo:update")
        response = self.client.post(
            url, {"id": item.pk, "text": "Updated", "completed": "on"}
        )

        self.assertRedirects(response, reverse("todo:list"))
        item.refresh_from_db()
        self.assertEqual(item.text, "Updated")
        self.assertTrue(item.completed)

    def test_delete_view(self):
        """Test deleting an item."""
        item = ToDoItem.objects.create(text="Delete me", completed=False)

        url = reverse("todo:delete")
        response = self.client.post(url, {"id": item.pk})

        self.assertRedirects(response, reverse("todo:list"))
        self.assertEqual(ToDoItem.objects.count(), 0)
```

Run tests:

```bash
python manage.py test
```

## Comparison: Django vs Express vs Next.js

| Feature       | Django              | Express          | Next.js                    |
| ------------- | ------------------- | ---------------- | -------------------------- |
| **Language**  | Python              | TypeScript       | TypeScript                 |
| **Rendering** | Server templates    | EJS templates    | React Server Components    |
| **Database**  | Django ORM          | TypeORM          | Drizzle ORM                |
| **Routing**   | urls.py             | Express Router   | File-based (app/)          |
| **Forms**     | CSRF token required | Manual handling  | Server Actions (auto CSRF) |
| **Testing**   | Django TestCase     | Jest + Supertest | Jest                       |
| **Admin**     | Built-in            | Manual           | Manual                     |

## Key Takeaways

1. **Django ORM is powerful** - models define schema and provide query API
2. **CSRF protection built-in** - use `{% csrf_token %}` in forms
3. **Template inheritance** - `{% extends %}` and `{% block %}` reduce duplication
4. **URL naming** - enables clean reverse lookups
5. **Test client** - simulate HTTP requests without a server

## Next Steps

- Enable the admin interface
- Add user authentication
- Implement form validation
- Deploy to production with gunicorn

---

_This tutorial is part of a series teaching the same todo application in three different frameworks:_

1. _Python + Django (this chapter)_
2. _TypeScript + Express_
3. _TypeScript + Next.js_
