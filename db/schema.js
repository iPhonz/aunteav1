import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";

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
