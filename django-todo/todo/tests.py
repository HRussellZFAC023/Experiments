"""
Tests for the Todo App
======================

This module contains unit and integration tests for the todo application.
Django's test framework provides:
  - TestCase: Base class with database transaction rollback per test
  - Client: Simulates HTTP requests without a running server
  - Assertions: assertRedirects, assertContains, assertTemplateUsed, etc.

Test Organization:
  - ToDoModelTest: Unit tests for the ToDoItem model
  - ToDoViewTest: Integration tests for views and HTTP endpoints

Running Tests:
  python manage.py test todo          # Run all tests in the todo app
  python manage.py test todo.tests.ToDoModelTest  # Run specific test class
  python manage.py test --keepdb      # Reuse test database for speed

cspell:ignore keepdb
"""

from django.test import TestCase
from django.urls import reverse
from todo.models import ToDoItem


# =============================================================================
# MODEL TESTS (Unit Tests)
# =============================================================================
class ToDoModelTest(TestCase):
    """
    Unit tests for the ToDoItem model.

    These tests verify that model methods and properties work correctly
    in isolation, without involving the full HTTP request/response cycle.
    """

    def test_str_returns_item_text(self):
        """
        The __str__ method should return the item's text.

        This is important for:
          - Admin interface display
          - Debugging and logging
          - Template rendering with {{ item }}
        """
        item = ToDoItem(text="Buy groceries")
        self.assertEqual(str(item), "Buy groceries")

    def test_default_completed_is_false(self):
        """
        New items should default to not completed.

        The model field: completed = models.BooleanField(default=False)
        """
        item = ToDoItem(text="New task")
        self.assertFalse(item.completed)

    def test_item_can_be_saved_and_retrieved(self):
        """
        Items should persist to the database and be retrievable.

        This tests Django's ORM save() and objects.get() methods.
        """
        item = ToDoItem.objects.create(text="Persist me", completed=False)

        retrieved = ToDoItem.objects.get(pk=item.pk)

        self.assertEqual(retrieved.text, "Persist me")
        self.assertFalse(retrieved.completed)
        self.assertIsNotNone(retrieved.created_on)


# =============================================================================
# VIEW TESTS (Integration Tests)
# =============================================================================
class ToDoViewTest(TestCase):
    """
    Integration tests for the todo views.

    These tests verify the full request/response cycle:
      1. URL routing (reverse() resolves to correct path)
      2. View logic (correct template, context data)
      3. Database operations (CRUD actions persist)
      4. Redirects (POST actions redirect to list)

    Key Django test utilities used:
      - self.client.get(url): Simulate GET request
      - self.client.post(url, data): Simulate POST request
      - self.assertRedirects(response, expected_url): Verify redirect
      - self.assertContains(response, text): Verify text in response
      - self.assertTemplateUsed(response, template): Verify template
    """

    # -------------------------------------------------------------------------
    # LIST VIEW TESTS
    # -------------------------------------------------------------------------
    def test_list_view_returns_200(self):
        """GET / should return HTTP 200 OK."""
        url = reverse("todo:list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_list_view_uses_correct_template(self):
        """GET / should render todo/index.html template."""
        url = reverse("todo:list")
        response = self.client.get(url)
        self.assertTemplateUsed(response, "todo/index.html")

    def test_list_view_shows_empty_message_when_no_items(self):
        """GET / should show empty state message when database is empty."""
        url = reverse("todo:list")
        response = self.client.get(url)
        self.assertContains(response, "No items in the list")

    def test_list_view_displays_existing_items(self):
        """GET / should display all items from the database."""
        ToDoItem.objects.create(text="First task", completed=False)
        ToDoItem.objects.create(text="Second task", completed=True)

        url = reverse("todo:list")
        response = self.client.get(url)

        self.assertContains(response, "First task")
        self.assertContains(response, "Second task")

    def test_list_view_shows_completed_status(self):
        """GET / should indicate which items are completed."""
        ToDoItem.objects.create(text="Done task", completed=True)

        url = reverse("todo:list")
        response = self.client.get(url)

        # The template adds 'checked' attribute for completed items
        self.assertContains(response, "checked")

    # -------------------------------------------------------------------------
    # CREATE VIEW TESTS
    # -------------------------------------------------------------------------
    def test_create_view_persists_new_item(self):
        """POST /create should save a new item to the database."""
        url = reverse("todo:create")
        self.client.post(url, {"text": "Brand new item"})

        items = ToDoItem.objects.all()
        self.assertEqual(items.count(), 1)
        first_item = items.first()
        assert first_item is not None
        self.assertEqual(first_item.text, "Brand new item")

    def test_create_view_redirects_to_list(self):
        """POST /create should redirect to the list view."""
        url = reverse("todo:create")
        response = self.client.post(url, {"text": "New item"})
        self.assertRedirects(response, reverse("todo:list"))

    def test_created_item_defaults_to_not_completed(self):
        """POST /create should create items as not completed."""
        url = reverse("todo:create")
        self.client.post(url, {"text": "New item"})

        item = ToDoItem.objects.first()
        assert item is not None
        self.assertFalse(item.completed)

    # -------------------------------------------------------------------------
    # UPDATE VIEW TESTS
    # -------------------------------------------------------------------------
    def test_update_view_changes_text(self):
        """POST /update should modify the item's text."""
        item = ToDoItem.objects.create(text="Original", completed=False)
        url = reverse("todo:update")

        self.client.post(url, {"id": item.pk, "text": "Modified"})

        item.refresh_from_db()
        self.assertEqual(item.text, "Modified")

    def test_update_view_can_mark_as_completed(self):
        """POST /update with completed='on' should mark item as done."""
        item = ToDoItem.objects.create(text="Task", completed=False)
        url = reverse("todo:update")

        self.client.post(url, {"id": item.pk, "text": "Task", "completed": "on"})

        item.refresh_from_db()
        self.assertTrue(item.completed)

    def test_update_view_can_uncheck_completed(self):
        """
        POST /update WITHOUT 'completed' key should uncheck item.

        This tests the critical "undo" behavior:
        - HTML checkboxes don't send any value when unchecked
        - The view must interpret missing 'completed' as False
        """
        item = ToDoItem.objects.create(text="Done task", completed=True)
        url = reverse("todo:update")

        # Omit 'completed' from POST data (simulates unchecked checkbox)
        self.client.post(url, {"id": item.pk, "text": "Done task"})

        item.refresh_from_db()
        self.assertFalse(item.completed, "Item should be unchecked")

    def test_update_view_redirects_to_list(self):
        """POST /update should redirect to the list view."""
        item = ToDoItem.objects.create(text="Task", completed=False)
        url = reverse("todo:update")

        response = self.client.post(url, {"id": item.pk, "text": "Task"})

        self.assertRedirects(response, reverse("todo:list"))

    # -------------------------------------------------------------------------
    # DELETE VIEW TESTS
    # -------------------------------------------------------------------------
    def test_delete_view_removes_item(self):
        """POST /delete should remove the item from the database."""
        item = ToDoItem.objects.create(text="Delete me", completed=False)
        url = reverse("todo:delete")

        self.client.post(url, {"id": item.pk})

        self.assertEqual(ToDoItem.objects.count(), 0)

    def test_delete_view_redirects_to_list(self):
        """POST /delete should redirect to the list view."""
        item = ToDoItem.objects.create(text="Delete me", completed=False)
        url = reverse("todo:delete")

        response = self.client.post(url, {"id": item.pk})

        self.assertRedirects(response, reverse("todo:list"))

    def test_delete_nonexistent_item_does_not_error(self):
        """POST /delete with invalid ID should not crash."""
        url = reverse("todo:delete")

        # Attempt to delete an item that doesn't exist
        response = self.client.post(url, {"id": 99999})

        # Should still redirect without error
        self.assertRedirects(response, reverse("todo:list"))
