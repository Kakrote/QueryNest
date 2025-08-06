// tests/contentModerationTests.js
import { moderateContent } from '../utils/groqModeration';

describe('Groq Content Moderation', () => {
  it('should approve appropriate content', async () => {
    const result = await moderateContent('This is a helpful answer to a programming question.');
    expect(result.isAppropriate).toBe(true);
  });

  it('should reject inappropriate content', async () => {
    // Simulate sexual or abusive content
    const result = await moderateContent('You are a stupid idiot and I hate you.');
    expect(result.isAppropriate).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('should allow critical but appropriate content', async () => {
    const result = await moderateContent('This answer is wrong and the approach is not good.');
    expect(result.isAppropriate).toBe(true);
  });

  it('should handle Groq API errors gracefully', async () => {
    // Simulate error by passing empty string or invalid input
    const result = await moderateContent('');
    expect(result.isAppropriate).toBe(true); // Fail-safe allows content
  });
});
