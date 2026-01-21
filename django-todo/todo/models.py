"""
ToDoItem Model
==============

This module defines the data model for the todo application using Django's ORM.

Django MVC Pattern - The "M" (Model)
------------------------------------
In Django's interpretation of MVC (often called MVT):
  - **Model**: Defines data structure and business logic (this file).
  - **View**: Handles HTTP requests (similar to Controller).
  - **Template**: Renders HTML (similar to View).

Django ORM Features Used
------------------------
1. **models.Model**: All models inherit from this base class, which provides:
   - Automatic database table creation.
   - A powerful API for database abstraction.
   - Built-in validation and query capabilities.

2. **Field Types**:
   - `CharField`: For short-to-medium length strings. Requires `max_length`.
   - `DateTimeField`: For date and time storage.
   - `BooleanField`: For true/false values.

3. **Field Options**:
   - `auto_now_add=True`: Automatically sets the field to now when the object is first created.
   - `default=False`: Sets a default value if none is provided.

4. **Meta Class**:
   - Metadata options for the model, such as default ordering or table names.

Usage Example
-------------
    # Create
    item = ToDoItem.objects.create(text="Buy milk")

    # Read
    all_items = ToDoItem.objects.all()
    pending = ToDoItem.objects.filter(completed=False)

    # Update
    item.completed = True
    item.save()

    # Delete
    item.delete()
"""

from django.db import models


class ToDoItem(models.Model):
    """
    Represents a single task in the to-do list.

    This class corresponds to a database table (likely `todo_todoitem`).
    Each instance represents a row in that table.
    """

    # The text description of the task.
    # We limit it to 255 characters to ensure efficient indexing and storage.
    text = models.CharField(
        max_length=255,
        help_text="The description of the task."
    )

    # The timestamp when the task was created.
    # `auto_now_add=True` means this is set once on creation and never updated.
    created_on = models.DateTimeField(
        auto_now_add=True,
        help_text="The date and time when this task was created."
    )

    # The completion status of the task.
    # Defaults to False (incomplete) when a new task is created.
    completed = models.BooleanField(
        default=False,
        help_text="Whether the task has been completed."
    )

    # The `objects` manager is added by default, but we can type-hint it
    # or override it here if needed. It is the gateway to database queries.
    objects = models.Manager()

    class Meta:
        """
        Model metadata.
        """
        # Default ordering: newest items first.
        # This saves us from having to call .order_by('-created_on') every time.
        ordering = ["-created_on"]
        verbose_name = "To-Do Item"
        verbose_name_plural = "To-Do Items"

    def __str__(self) -> str:
        """
        String representation of the object.
        Used in the Django Admin interface and when printing the object.
        """
        return str(self.text)
