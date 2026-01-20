"""
Todo Views (Controllers)
========================

This module defines the view functions that handle HTTP requests and return responses.

Django MVC Pattern - The "V" (View/Controller)
----------------------------------------------
In Django's interpretation of MVC:
  - **Model**: Defines data structure (models.py)
  - **View**: Handles HTTP requests and returns responses (THIS FILE)
  - **Template**: Renders HTML using context data (templates/*.html)

Django views act as "controllers" in traditional MVC terminology.
They:
  1. Receive HTTP requests (GET, POST, etc.)
  2. Interact with models to query/modify data
  3. Return HTTP responses (rendered templates, redirects, JSON, etc.)

Request/Response Cycle
----------------------
1. User makes HTTP request → Django URL dispatcher
2. URL dispatcher matches path → calls view function
3. View function receives HttpRequest object
4. View queries/modifies database via models
5. View returns HttpResponse (rendered template or redirect)
6. Response sent back to user's browser

Key Django Imports Used
-----------------------
- HttpRequest: Incoming request object with:
    - request.method: 'GET', 'POST', etc.
    - request.GET: Query parameters dictionary
    - request.POST: Form data dictionary
    - request.user: Current user (if authenticated)

- HttpResponse: Outgoing response object with:
    - status_code: HTTP status (200, 301, 404, etc.)
    - content: Response body
    - headers: HTTP headers

- render(): Shortcut that:
    1. Loads a template file
    2. Renders it with context data
    3. Returns HttpResponse with the HTML

- redirect(): Shortcut that:
    1. Creates HttpResponse with status 302
    2. Sets Location header to target URL
    - Can accept URL name (e.g., "todo:list") or path ("/")

- get_object_or_404(): Shortcut that:
    1. Queries the model
    2. Returns object if found
    3. Raises Http404 if not found

URL Name Resolution
-------------------
Django uses named URLs for flexibility. Instead of hardcoding paths:
    return redirect("/")  # Brittle - breaks if URL changes

We use URL names:
    return redirect("todo:list")  # Robust - works even if path changes

The "todo:list" format is:
    - "todo": The app namespace (defined in website/urls.py)
    - "list": The URL name (defined in todo/urls.py)

Form Data Handling
------------------
HTML forms send data based on input name attributes:
    <input name="text" value="Buy groceries">

In the view, access it via:
    request.POST.get("text")  # Returns "Buy groceries" or None
    request.POST["text"]      # Returns "Buy groceries" or raises KeyError

Checkbox Behavior (IMPORTANT):
    - Checked: Sends the field (completed="on")
    - Unchecked: Does NOT send the field at all!

    Therefore, to detect unchecked:
        item.completed = "completed" in request.POST
    NOT:
        item.completed = request.POST.get("completed") == "on"
    (The latter works for checking, but the former handles both cases)
"""

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render

from todo.models import ToDoItem


def index(request: HttpRequest) -> HttpResponse:
    """
    List all to-do items (READ operation).

    HTTP Method: GET
    URL: / (named "todo:list")
    Template: todo/index.html

    Context:
        items (QuerySet): All ToDoItem objects, newest first

    Returns:
        HttpResponse: Rendered HTML page with item list
    """
    items = ToDoItem.objects.order_by("-created_on")
    context = {"items": items}
    return render(request, "todo/index.html", context)


def create(request: HttpRequest) -> HttpResponse:
    """
    Create a new to-do item (CREATE operation).

    HTTP Method: POST
    URL: /create (named "todo:create")

    Expected POST data:
        text (str): The task description (required)

    Returns:
        HttpResponseRedirect: Redirects to list view on success
    """
    item = ToDoItem(text=request.POST["text"])
    item.completed = False
    item.save()
    return redirect("todo:list")


def delete(request: HttpRequest) -> HttpResponse:
    """
    Delete a to-do item (DELETE operation).

    HTTP Method: POST
    URL: /delete (named "todo:delete")

    Expected POST data:
        id (int): Primary key of item to delete

    Returns:
        HttpResponseRedirect: Redirects to list view

    Note:
        We use filter().delete() instead of get().delete() because
        filter() doesn't raise an exception if the item doesn't exist.
        This makes the operation idempotent.
    """
    ToDoItem.objects.filter(pk=request.POST["id"]).delete()
    return redirect("todo:list")


def update(request: HttpRequest) -> HttpResponse:
    """
    Update an existing to-do item (UPDATE operation).

    HTTP Method: POST
    URL: /update (named "todo:update")

    Expected POST data:
        id (int): Primary key of item to update
        text (str): New task description
        completed (str, optional): "on" if checkbox is checked

    Returns:
        HttpResponseRedirect: Redirects to list view

    Important - Checkbox Handling:
        HTML checkboxes do NOT send a value when unchecked.
        We must check for the KEY's existence, not its value:

            item.completed = "completed" in request.POST

        This evaluates to:
            - True if the checkbox was checked (key exists)
            - False if the checkbox was unchecked (key missing)
    """
    if request.method == "POST":
        item_id = request.POST.get("id")
        item = get_object_or_404(ToDoItem, pk=item_id)

        # In HTML, if a checkbox is unchecked, it isn't sent in the POST data.
        # So we check for the presence of the key.
        item.completed = "completed" in request.POST
        item.text = request.POST.get("text", item.text)
        item.save()

    return redirect("todo:list")
