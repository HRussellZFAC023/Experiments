import { DataSource } from "typeorm";
import { ToDoItem } from "./models/ToDoItem";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "db.sqlite",
  entities: [ToDoItem],
  synchronize: true,
  logging: false,
});
