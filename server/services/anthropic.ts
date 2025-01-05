import Anthropic from '@anthropic-ai/sdk';
import { db } from '@db';
import { newsArticles } from '@db/schema';
import { desc } from 'drizzle-orm';

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeText(text: string): Promise<{
  message: string;
  references?: Array<{
    title: string;
    url: string;
    imageUrl?: string;
  }>;
}> {
  try {
    // Fetch recent news articles to provide as context
    const recentArticles = await db.select()
      .from(newsArticles)
      .orderBy(desc(newsArticles.publishDate))
      .limit(10);

    console.log('Recent articles for context:', recentArticles.map(a => ({ 
      title: a.title, 
      date: a.publishDate 
    })));

    const articlesContext = recentArticles.map(article => 
      `Title: ${article.title}\nContent: ${article.content}\nURL: ${article.url}\nDate: ${article.publishDate}`
    ).join('\n\n');

    const message = await anthropic.messages.create({
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are AunTea, a friendly and knowledgeable news companion with a warm, approachable personality. You have access to the following recent news articles:

${articlesContext}

Using this recent news context, please analyze and respond to this query in a natural, friendly way: ${text}

Format your response as JSON with this structure:
{
  "message": "Your conversational response here (keep it concise, 2-3 sentences max)",
  "references": [
    {
      "title": "Referenced article title",
      "url": "Article URL",
      "imageUrl": "Image URL if available"
    }
  ]
}

Include only the most relevant articles in your references.`
      }],
      model: 'claude-3-5-sonnet-20241022',
    });

    // Access the text content safely by checking if it exists
    const content = message.content[0];
    if ('text' in content) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('Parsed Claude response:', parsed);

          // Ensure references are from our actual articles
          if (parsed.references) {
            parsed.references = parsed.references.filter(ref => 
              recentArticles.some(article => 
                article.url === ref.url || 
                article.title === ref.title
              )
            ).map(ref => {
              const matchingArticle = recentArticles.find(article => 
                article.url === ref.url || 
                article.title === ref.title
              );
              return {
                ...ref,
                url: matchingArticle?.url || ref.url,
                imageUrl: matchingArticle?.imageUrl
              };
            });
            console.log('Processed references:', parsed.references);
          }
          return parsed;
        }
        console.log('No JSON found in response, raw text:', content.text);
        // If no JSON found, return just the message
        return { message: content.text };
      } catch (error) {
        console.error('Failed to parse Claude response:', error);
        // If parsing fails, return just the message
        return { message: content.text };
      }
    }
    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to analyze text with Claude');
  }
}