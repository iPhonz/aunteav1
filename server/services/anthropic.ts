import Anthropic from '@anthropic-ai/sdk';

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
    const message = await anthropic.messages.create({
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are AunTea, a friendly and knowledgeable news companion with a warm, approachable personality. You love discussing current events and making complex news topics easy to understand. Your responses should be concise, engaging, and conversational - like chatting with a well-informed friend over tea.

Please analyze this news-related query and provide a natural, friendly response with relevant article references: ${text}

Keep your response focused and under 3-4 sentences when possible, using a warm, conversational tone. Include references to news articles that support your response.`
      }],
      model: 'claude-3-5-sonnet-20241022',
    });

    // Access the text content safely by checking if it exists
    const content = message.content[0];
    if ('text' in content) {
      try {
        // Try to extract JSON from the response if it contains references
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        // If no JSON found, return just the message
        return { message: content.text };
      } catch (error) {
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