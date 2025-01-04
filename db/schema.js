import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  role: text("role").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  url: text("url").notNull(),
  imageUrl: text("image_url"),
  source: text("source").notNull(),
  publishDate: timestamp("publish_date").notNull(),
  fetchDate: timestamp("fetch_date").defaultNow().notNull(),
});

export const trends = pgTable("trends", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'phrase' or 'person'
  content: text("content").notNull(),
  frequency: serial("frequency").notNull(),
  context: jsonb("context"),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertChatSchema = createInsertSchema(chatHistory);
export const selectChatSchema = createSelectSchema(chatHistory);
export const insertNewsSchema = createInsertSchema(newsArticles);
export const selectNewsSchema = createSelectSchema(newsArticles);
export const insertTrendSchema = createInsertSchema(trends);
export const selectTrendSchema = createSelectSchema(trends);