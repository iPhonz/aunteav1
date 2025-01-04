import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { chatHistory, chatSessions, newsArticles, trends } from "@db/schema";
import { desc, eq } from "drizzle-orm";
import { setupWebSocket } from "./services/websocket";
import { analyzeText } from "./services/anthropic";
import { fetchAndParseFeeds } from "./services/rssParser";
import { updateTrends } from "./services/trends";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Setup WebSocket
  setupWebSocket(httpServer);

  // Chat sessions endpoints
  app.get("/api/chat/sessions", async (_req, res) => {
    try {
      const sessions = await db.select().from(chatSessions)
        .orderBy(desc(chatSessions.updatedAt));

      // Get messages for each session
      const sessionsWithMessages = await Promise.all(
        sessions.map(async (session) => {
          const messages = await db.select().from(chatHistory)
            .where(eq(chatHistory.sessionId, session.id))
            .orderBy(desc(chatHistory.timestamp));

          return {
            ...session,
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.message,
              references: msg.references
            }))
          };
        })
      );

      res.json(sessionsWithMessages);
    } catch (error) {
      console.error('Chat sessions error:', error);
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const { title } = req.body;
      const [session] = await db.insert(chatSessions)
        .values({ title })
        .returning();
      res.json(session);
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ error: "Failed to create chat session" });
    }
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      const response = await analyzeText(message);

      // Store user message
      await db.insert(chatHistory).values({
        sessionId: parseInt(sessionId),
        message: message,
        role: "user",
      });

      // Store assistant response
      await db.insert(chatHistory).values({
        sessionId: parseInt(sessionId),
        message: response.message,
        role: "assistant",
        references: response.references,
      });

      // Update session timestamp
      await db.update(chatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessions.id, parseInt(sessionId)));

      res.json(response);
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

  // Initialize feed and trend analysis
  const REFRESH_INTERVAL = 1 * 60 * 1000; // 1 minute for testing

  setInterval(async () => {
    await fetchAndParseFeeds();
    await updateTrends();
  }, REFRESH_INTERVAL);

  // Initial fetch
  Promise.all([
    fetchAndParseFeeds(),
    updateTrends()
  ]).catch(error => {
    console.error('Initial data fetch error:', error);
  });

  return httpServer;
}