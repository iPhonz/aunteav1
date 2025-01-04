import Parser from 'rss-parser';
import { db } from '@db';
import { newsArticles } from '@db/schema';
import { eq } from 'drizzle-orm';

const parser = new Parser();

const RSS_FEEDS = [
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://www.reuters.com/rss/world',
  'https://feeds.npr.org/1001/rss.xml',
  'http://rss.cnn.com/rss/cnn_world.rss',
  'https://www.washingtonpost.com/world/?resType=rss'
];

export async function fetchAndParseFeeds() {
  try {
    for (const feedUrl of RSS_FEEDS) {
      const feed = await parser.parseURL(feedUrl);
      
      for (const item of feed.items) {
        // Check if article already exists
        const existing = await db.select()
          .from(newsArticles)
          .where(eq(newsArticles.url, item.link || ''))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(newsArticles).values({
            title: item.title || '',
            content: item.contentSnippet || item.content || '',
            url: item.link || '',
            source: feed.title || 'Unknown',
            publishDate: new Date(item.pubDate || Date.now()),
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch and parse RSS feeds:', error);
  }
}
