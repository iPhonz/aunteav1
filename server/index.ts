import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

(async () => {
  const server = registerRoutes(app);

  // Setup vite in development
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
})();