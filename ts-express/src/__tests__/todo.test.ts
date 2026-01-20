import request from "supertest";
import { AppDataSource } from "../data-source";
import { ToDoItem } from "../models/ToDoItem";
import app from "../index";

beforeAll(async () => {
  await AppDataSource.initialize();
  await ToDoItem.clear();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

beforeEach(async () => {
  await ToDoItem.clear();
});

describe("ToDoItem model", () => {
  test("toString returns the text", () => {
    const item = new ToDoItem();
    item.text = "Test item";
    item.completed = true;
    expect(item.toString()).toBe("Test item");
  });
});

describe("To-Do list endpoints", () => {
  test("GET / (list) shows no items message when empty", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("No items in the list.");
  });

  test("POST /create adds a new item", async () => {
    const newText = "New item via test";
    const res = await request(app)
      .post("/create")
      .send(`text=${encodeURIComponent(newText)}`)
      .expect(302);

    expect(res.headers.location).toBe("/");

    const items = await ToDoItem.find();
    expect(items.length).toBe(1);
    expect(items[0].text).toBe(newText);
    expect(items[0].completed).toBe(false);
  });

  test("POST /update modifies an existing item", async () => {
    const item = new ToDoItem();
    item.text = "Item to update";
    item.completed = false;
    await item.save();

    const newText = "Item has been updated";
    const res = await request(app)
      .post("/update")
      .send(`id=${item.id}&text=${encodeURIComponent(newText)}&completed=on`)
      .expect(302);

    expect(res.headers.location).toBe("/");

    const updated = await ToDoItem.findOneBy({ id: item.id });
    expect(updated).not.toBeNull();
    expect(updated!.text).toBe(newText);
    expect(updated!.completed).toBe(true);
  });

  test("POST /delete removes the item", async () => {
    const item = await ToDoItem.create({
      text: "Delete me",
      completed: false,
    }).save();
    const id = item.id;

    const res = await request(app).post("/delete").send(`id=${id}`).expect(302);

    expect(res.headers.location).toBe("/");

    const deletedItem = await ToDoItem.findOneBy({ id });
    expect(deletedItem).toBeNull();
  });
});
