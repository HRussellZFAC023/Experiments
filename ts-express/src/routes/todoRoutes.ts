import { Router } from "express";
import { ToDoItem } from "../models/ToDoItem";

const router = Router();

// GET "/" - list all to-do items
router.get("/", async (req, res) => {
  const items = await ToDoItem.find({ order: { createdOn: "DESC" } });
  res.render("todo/index", { items });
});

// POST "/create" - create a new to-do item
router.post("/create", async (req, res) => {
  try {
    const text = req.body.text;
    if (!text || text.trim() === "") {
      return res.redirect("/");
    }
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

// POST "/update" - update an existing item
router.post("/update", async (req, res) => {
  try {
    const id = parseInt(req.body.id);
    const newText = req.body.text;
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

// POST "/delete" - delete an item
router.post("/delete", async (req, res) => {
  try {
    const id = parseInt(req.body.id);
    await ToDoItem.delete({ id });
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
