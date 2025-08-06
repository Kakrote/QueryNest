// utils/groqModeration.js
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Checks if the given content is appropriate using Groq moderation.
 * @param {string} content - The content to check.
 * @returns {Promise<{isAppropriate: boolean, reason?: string}>}
 */
export async function moderateContent(content) {
  // Prompt for moderation - only restrict sexual and abusive content
  const prompt = `Analyze this content for a Q&A platform. Does it contain:
1. Explicit sexual content
2. Hate speech or personal attacks
3. Offensive profanity directed at people

Answers like "I don't know", technical criticism, disagreements, or incomplete answers are ALLOWED.

Content to check: "${content}"

Reply only with 'INAPPROPRIATE' if it contains the above issues, or 'OK' if it's acceptable.`;
  try {
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    });
    const response = completion.choices[0]?.message?.content?.toLowerCase().trim();
    if (response.includes('ok') || response.includes('acceptable')) {
      return { isAppropriate: true };
    } else if (response.includes('inappropriate')) {
      // Extract reason if present - content contains sexual or abusive content
      const reason = response.replace('inappropriate', '').trim();
      return { isAppropriate: false, reason: reason || 'Content violates community guidelines' };
    } else {
      // Default to allowing content if response is unclear
      return { isAppropriate: true };
    }
  } catch (error) {
    console.error('Groq moderation error:', error);
    // Fail-safe: allow content if Groq fails, but log error
    return { isAppropriate: true };
  }
}
