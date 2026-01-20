"""
Todo URL Configuration
======================

This module maps URL paths to view functions for the todo application.

Django MVC Pattern - URL Routing
--------------------------------
Django uses a two-level URL configuration:

1. **Project URLs** (website/urls.py):
   - Root URL configuration
   - Includes app-specific URLs with optional namespace prefix
   - Example: path("", include("todo.urls"))

2. **App URLs** (todo/urls.py - THIS FILE):
   - App-specific URL patterns
   - Maps paths to view functions
   - Defines URL names for reverse lookup

URL Pattern Syntax
------------------
Django uses the `path()` function to define URL patterns:

    path(route, view, name=None)

    - route: URL pattern string (e.g., "", "create", "items/<int:pk>/")
    - view: View function to call when pattern matches
    - name: Optional name for reverse URL lookup

Path Converters (for dynamic URLs):
    <int:pk>     - Matches integers, passes as keyword argument
    <str:slug>   - Matches strings (excluding /)
    <slug:slug>  - Matches slug strings (letters, numbers, hyphens, underscores)
    <uuid:id>    - Matches UUID strings
    <path:rest>  - Matches any string including /

URL Namespacing
---------------
The `app_name` variable creates a namespace for this app's URLs.
This prevents name collisions between different apps.

Usage in templates:
    {% url 'todo:list' %}      → resolves to "/"
    {% url 'todo:create' %}    → resolves to "/create"

Usage in views:
    redirect("todo:list")      → redirects to "/"
    reverse("todo:create")     → returns "/create"

Without namespacing, you would use:
    {% url 'list' %}           → might collide with urls from other apps

URL Patterns Defined
--------------------
/           → index view  (name: "list")   - Lists all items
/create     → create view (name: "create") - Creates new item
/delete     → delete view (name: "delete") - Deletes an item
/update     → update view (name: "update") - Updates an item

All paths are relative to the app's mount point in the project URLs.
If the app is mounted at "/" (as we do), paths are absolute.
If mounted at "/todos/", paths would be "/todos/", "/todos/create", etc.
"""

from django.urls import path

from todo.views import create, delete, index, update

# Namespace for this app's URLs
# Used as prefix in URL names: "todo:list", "todo:create", etc.
app_name = "todo"  # pylint: disable=invalid-name

# URL patterns for the todo app
# Each tuple: (path, view_function, name)
urlpatterns = [
    # GET / - List all items
    path("", index, name="list"),
    # POST /create - Create a new item
    path("create", create, name="create"),
    # POST /delete - Delete an item
    path("delete", delete, name="delete"),
    # POST /update - Update an item
    path("update", update, name="update"),
]
