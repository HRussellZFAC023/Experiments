import "reflect-metadata";
import express from "express";
import path from "path";
import { AppDataSource } from "./data-source";
import todoRouter from "./routes/todoRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup (EJS)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Routes
app.use("/", todoRouter);

// Export app for testing
export default app;

// Initialize database and start server (only when run directly)
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => {
      console.log("Database initialized");
      app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Error during Data Source initialization:", err);
    });
}
