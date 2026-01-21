/**
 * Todo Controller (Routes)
 * ========================
 *
 * This module defines the route handlers for the application. In Express,
 * "routes" often serve the role of the "Controller" in MVC: they process
 * incoming requests, interact with the Model, and choose the View to render.
 *
 * Express Router
 * --------------
 * We use `express.Router()` to create a modular, mountable set of route handlers.
 * This keeps `index.ts` clean and allows us to group related routes (like all todo operations).
 *
 * Application Logic
 * -----------------
 * - **GET /**: Lists all items.
 * - **POST /create**: Adds a new item using form data.
 * - **POST /update**: Modifies an existing item's text or completion status.
 * - **POST /delete**: Removes an item.
 */

import { Router, Request, Response } from "express";
import { ToDoItem } from "../models/ToDoItem";

const router = Router();

/**
 * GET /
 * Fetches all to-do items and renders the index page.
 */
router.get("/", async (req: Request, res: Response) => {
  // Active Record pattern: Query directly on the class
  const items = await ToDoItem.find({
    order: { createdOn: "DESC" }, // Usage of options to sort results
  });

  // Render the 'todo/index.ejs' template with the data
  res.render("todo/index", { items });
});

/**
 * POST /create
 * Handles form submission to create a new task.
 */
router.post("/create", async (req: Request, res: Response) => {
  try {
    const text = req.body.text;

    // Basic validation
    if (!text || text.trim() === "") {
      return res.redirect("/");
    }

    // Create and save using Active Record
    const item = new ToDoItem();
    item.text = text;
    item.completed = false;
    await item.save();

    res.redirect("/");
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * POST /update
 * Updates an item's status or text based on form input.
 */
router.post("/update", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.body.id);
    const newText = req.body.text;
    // Checkboxes only send value if checked. We check if it equals "on".
    const completed = req.body.completed === "on";

    const item = await ToDoItem.findOneBy({ id });

    if (item) {
      item.text = newText;
      item.completed = completed;
      await item.save();
    }

    res.redirect("/");
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * POST /delete
 * Removes an item from the database.
 */
router.post("/delete", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.body.id);
    // .delete() can be called with criteria, no need to fetch first
    await ToDoItem.delete({ id });
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
