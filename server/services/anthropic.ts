import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeText(text: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze this news-related query and provide a detailed response: ${text}`
      }],
      model: 'claude-3-5-sonnet-20241022',
    });

    // Access the text content safely by checking if it exists
    const content = message.content[0];
    if ('text' in content) {
      return content.text;
    }
    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to analyze text with Claude');
  }
}