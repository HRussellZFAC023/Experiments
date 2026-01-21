/**
 * Express Application Entry Point
 * ===============================
 *
 * This is the main file that bootstraps the Node.js application.
 * It sets up the server, middleware, view engine, and database connection.
 *
 * Key Components
 * --------------
 * 1. **Express App**: The central object (`app`) that handles all requests.
 * 2. **Middleware**: Functions that run during the request lifecycle (e.g., body parsing).
 * 3. **View Engine**: Configures EJS to render dynamic HTML templates.
 * 4. **Routes**: Mounts our `todoRouter` to handle application logic.
 * 5. **Database**: Initializes TypeORM before starting the server to ensure connectivity.
 */

import "reflect-metadata"; // Required for TypeORM decorators
import express from "express";
import path from "path";
import { AppDataSource } from "./data-source";
import todoRouter from "./routes/todoRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Configuration
// ------------------------

// Parse JSON bodies (for API requests)
app.use(express.json());

// Parse URL-encoded bodies (for HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// View Engine Setup
// -----------------
// Set the directory where template files are located
app.set("views", path.join(__dirname, "views"));
// Helper standard MVC pattern: View Logic is separated from Controller Logic
app.set("view engine", "ejs");

// Route Registration
// ------------------
// Mount the todo routes at the root URL path
app.use("/", todoRouter);

// Database & Server Startup
// -------------------------

// Export the app for testing purposes (so tests can load it without starting a server)
export default app;

// If this file is run directly (start script), initialize DB and listen
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
