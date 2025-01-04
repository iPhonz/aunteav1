import { db } from '@db';
import { trends, newsArticles } from '@db/schema';
import { desc, sql } from 'drizzle-orm';
import { analyzeText } from './anthropic';

export async function updateTrends() {
  try {
    // Get recent articles
    const recentArticles = await db.select().from(newsArticles)
      .orderBy(desc(newsArticles.publishDate))
      .limit(50);

    // Analyze articles for trends
    for (const article of recentArticles) {
      const prompt = `Analyze this news article and extract key phrases and people mentioned. Format as JSON with "phrases" and "people" arrays:

${article.title}
${article.content}`;

      const response = await analyzeText(prompt);
      
      try {
        const analysis = JSON.parse(response);
        
        // Insert phrases
        for (const phrase of analysis.phrases || []) {
          await db.insert(trends).values({
            type: 'phrase',
            content: phrase,
            frequency: 1,
            context: { articleId: article.id }
          }).onConflictDoUpdate({
            target: [trends.content, trends.type],
            set: {
              frequency: sql`${trends.frequency} + 1`
            }
          });
        }

        // Insert people
        for (const person of analysis.people || []) {
          await db.insert(trends).values({
            type: 'person',
            content: person,
            frequency: 1,
            context: { articleId: article.id }
          }).onConflictDoUpdate({
            target: [trends.content, trends.type],
            set: {
              frequency: sql`${trends.frequency} + 1`
            }
          });
        }
      } catch (error) {
        console.error('Failed to parse trend analysis:', error);
      }
    }

    console.log('Trends updated successfully');
  } catch (error) {
    console.error('Failed to update trends:', error);
  }
}
