"""
Todo Views (Controllers)
========================

This module handles the application logic by processing HTTP requests and returning responses.

Django MVC Pattern - The "V" (View)
-----------------------------------
In Django, "Views" are what traditional MVC frameworks call "Controllers".
They handle the "C" in MVC:
  1. Receive an HTTP Request (`request`).
  2. Implement business logic (e.g., getting data from the Model).
  3. Return an HTTP Response (usually by rendering a Template).

Request-Response Cycle
----------------------
1. User visits a URL (e.g., `/create`).
2. Django's URL dispatcher matches the URL to a view function (e.g., `create`).
3. The view function is called with the `request` object.
4. The view does its work (queries DB, validates form data).
5. The view returns a `HttpResponse` (or a subclass like `HttpResponseRedirect`).

Key Concepts
------------
- **HttpRequest**: Object containing metadata about the request (method, POST data, etc.).
- **HttpResponse**: Object containing the content to send back to the user.
- **render()**: Helper that loads a template context and returns an HttpResponse.
- **redirect()**: Helper that returns a 302/301 redirect response.
- **get_object_or_404**: Helper that tries to get an object or raises a 404 error if not found.
"""

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render

from todo.models import ToDoItem


def index(request: HttpRequest) -> HttpResponse:
    """
    Display the main page with a list of to-do items.

    Logic:
      1. Fetch all items from the database, ordered by creation date (newest first).
      2. Pass these items to the template context.
      3. Render the 'todo/index.html' template.

    Args:
        request: The incoming HTTP request.

    Returns:
        HttpResponse: The rendered HTML page.
    """
    # Query the database using the Django ORM.
    # The "-" prefix in "-created_on" indicates descending order.
    items = ToDoItem.objects.order_by("-created_on")

    # The context dictionary makes data available to the template.
    # Keys in this dictionary become variable names in the template (e.g., {{ items }}).
    context = {"items": items}

    return render(request, "todo/index.html", context)


def create(request: HttpRequest) -> HttpResponse:
    """
    Handle the creation of a new to-do item.

    Expected Method: POST
    Form Data: 'text' (the task description)

    Logic:
      1. Extract the 'text' from the POST data.
      2. Create a new ToDoItem object.
      3. Save it to the database.
      4. Redirect back to the index page to show the updated list.

    Note: We rely on the View to act as the "Controller" here, mediating between
    the user's input (POST data) and the Model (database).
    """
    # Access POST data dictionary-like.
    # In a real app, we would use Django Forms for robust validation.
    # Here, we do manually for simplicity/demonstration.
    new_text = request.POST["text"]

    # Create an instance and save it in one step (optional, can also be done separately).
    item = ToDoItem(text=new_text)
    item.completed = False  # Explicitly set default (though model handles this too)
    item.save()

    # Always redirect after a successful POST to prevent "double submission"
    # if the user refreshes the page (Post/Redirect/Get pattern).
    return redirect("todo:list")


def delete(request: HttpRequest) -> HttpResponse:
    """
    Delete a specific to-do item.

    Expected Method: POST
    Form Data: 'id' (the primary key of the item to delete)

    Logic:
      1. Get the ID from the POST data.
      2. Try to find the item and delete it.
      3. Redirect back to the index view.
    """
    item_id = request.POST["id"]

    # We use filter().delete() which is efficient and safe.
    # If the item doesn't exist, it does nothing (no error raised).
    # Equivalent to: DELETE FROM todo_todoitem WHERE id = item_id;
    ToDoItem.objects.filter(pk=item_id).delete()

    return redirect("todo:list")


def update(request: HttpRequest) -> HttpResponse:
    """
    Update an existing item's status or text.

    Expected Method: POST
    Form Data:
      - 'id': Primary key of the item.
      - 'text': (Optional) Updated text.
      - 'completed': 'on' if checked, missing if unchecked.

    Logic:
      1. Retrieve the item by ID. Raise 404 if not found.
      2. Update the 'completed' status based on the presence of the form key.
      3. Update the 'text' if provided.
      4. Save the changes.
      5. Redirect.
    """
    if request.method == "POST":
        item_id = request.POST.get("id")

        # `get_object_or_404` is a safer alternative to `ToDoItem.objects.get()`.
        # It handles the DoesNotExist exception by returning a standard 404 page.
        item = get_object_or_404(ToDoItem, pk=item_id)

        # Checkbox Handling Explanation:
        # Standard HTML checkboxes only send their value (usually "on") if checked.
        # If unchecked, the browser does NOT send the key at all.
        # So we check checks for the *existence* of the "completed" key in request.POST.
        item.completed = "completed" in request.POST

        # We update text if it's there, otherwise keep existing text using `.get()` default.
        item.text = request.POST.get("text", item.text)

        item.save()

    return redirect("todo:list")

