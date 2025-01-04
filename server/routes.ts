import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { chatHistory, newsArticles, trends } from "@db/schema";
import { desc } from "drizzle-orm";
import { setupWebSocket } from "./services/websocket.js";
import { analyzeText } from "./services/anthropic.js";
import { fetchAndParseFeeds } from "./services/rssParser.js";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Setup WebSocket
  setupWebSocket(httpServer);

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const response = await analyzeText(message);

      await db.insert(chatHistory).values({
        message,
        role: "user",
      });

      await db.insert(chatHistory).values({
        message: response,
        role: "assistant",
      });

      res.json({ message: response });
    } catch (error) {
      console.error('Chat endpoint error:', error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // News feeds endpoint
  app.get("/api/news", async (_req, res) => {
    try {
      const articles = await db.select().from(newsArticles)
        .orderBy(desc(newsArticles.publishDate))
        .limit(20);
      res.json(articles);
    } catch (error) {
      console.error('News feed error:', error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Trends endpoint
  app.get("/api/trends", async (_req, res) => {
    try {
      const trendData = await db.select().from(trends)
        .orderBy(desc(trends.frequency))
        .limit(50);
      res.json(trendData);
    } catch (error) {
      console.error('Trends error:', error);
      res.status(500).json({ error: "Failed to fetch trends" });
    }
  });

  // Initialize feed fetching
  const RSS_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  setInterval(fetchAndParseFeeds, RSS_REFRESH_INTERVAL);
  fetchAndParseFeeds().catch(error => {
    console.error('Initial feed fetch error:', error);
  });

  return httpServer;
}