# Django Todo App

A minimalist todo application built with Django and Python.

## Quick Start

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install django

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

Open http://localhost:8000

## Stack

- **Django** - Web framework
- **Python** - Language
- **SQLite** - Database
- **Django ORM** - Database access

## Commands

| Command                           | Description       |
| --------------------------------- | ----------------- |
| `python manage.py runserver`      | Start dev server  |
| `python manage.py test`           | Run tests         |
| `python manage.py makemigrations` | Create migrations |
| `python manage.py migrate`        | Apply migrations  |

## Project Structure

```
django-todo/
├── manage.py              # Django CLI
├── website/               # Project settings
│   ├── settings.py
│   └── urls.py
└── todo/                  # Todo app
    ├── models.py          # Database models
    ├── views.py           # View functions
    ├── urls.py            # URL routing
    ├── tests.py           # Tests
    ├── templates/         # HTML templates
    └── static/            # CSS files
```

## Tutorial

See [TUTORIAL.md](./TUTORIAL.md) for a step-by-step guide.

---

_Part of a three-framework comparison: [Django](../django-todo) | [Express](../express-todo) | [Next.js](../nextjs-todo)_
