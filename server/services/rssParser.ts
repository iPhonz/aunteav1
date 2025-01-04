import Parser from 'rss-parser';
import { db } from '@db';
import { newsArticles } from '@db/schema';
import { eq } from 'drizzle-orm';

// Extend Parser type to include media content
type CustomFeed = Parser.Output<any> & {
  items: (Parser.Item & {
    media?: {
      content?: { url?: string }[];
    };
    enclosure?: { url?: string };
    'media:content'?: { $: { url?: string } }[];
  })[];
};

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content'],
      'media:content',
      'enclosure'
    ],
  },
});

const RSS_FEEDS = [
  'https://rss.app/feeds/v1.1/_6QzByBP0Y0E9bL0O.json',
  'https://rss.app/feeds/v1.1/_p1hbSzosU9dbDQWx.json',
  'https://rss.app/feeds/v1.1/_fcZVOvvC7xA6iz8u.json',
  'https://rss.app/feeds/v1.1/_8Tib7bkE02swlmp7.json',
  'https://rss.app/feeds/v1.1/_5pZybCiMDbl5fBo8.json',
  'https://rss.app/feeds/v1.1/_GNEAg9D5CvYRIxAQ.json'
];

function extractImageUrl(item: CustomFeed['items'][0]): string | undefined {
  // Try different possible locations for image URLs
  return item.enclosure?.url ||
    item['media:content']?.[0]?.$.url ||
    item.media?.content?.[0]?.url;
}

export async function fetchAndParseFeeds() {
  console.log('Starting to fetch RSS feeds...');
  try {
    for (const feedUrl of RSS_FEEDS) {
      console.log(`Fetching feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl) as CustomFeed;

      for (const item of feed.items) {
        // Check if article already exists
        const existing = await db.select()
          .from(newsArticles)
          .where(eq(newsArticles.url, item.link || ''))
          .limit(1);

        if (existing.length === 0) {
          const imageUrl = extractImageUrl(item);

          await db.insert(newsArticles).values({
            title: item.title || '',
            content: item.contentSnippet || item.content || '',
            url: item.link || '',
            imageUrl: imageUrl,
            source: feed.title || 'Unknown',
            publishDate: new Date(item.pubDate || Date.now()),
          });
          console.log(`Added new article: ${item.title}`);
        }
      }
    }
    console.log('Completed fetching and parsing RSS feeds');
  } catch (error) {
    console.error('Failed to fetch and parse RSS feeds:', error);
  }
}