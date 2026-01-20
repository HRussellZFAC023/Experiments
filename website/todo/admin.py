"""Admin registration for the todo app."""

from django.contrib import admin
from .models import ToDoItem

# Register the ToDoItem model in the admin site.
admin.site.register(ToDoItem)
