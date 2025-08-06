import { test, expect } from '@playwright/test';
import { slugify } from '../../utils/slugify.js';

test.describe('Utils - Slugify Function', () => {
  test('should convert text to lowercase slug', () => {
    const result = slugify('Hello World');
    expect(result).toBe('hello-world');
  });

  test('should handle special characters', () => {
    const result = slugify('Hello, World! How are you?');
    expect(result).toBe('hello-world-how-are-you');
  });

  test('should handle multiple spaces', () => {
    const result = slugify('Hello    World   Test');
    expect(result).toBe('hello-world-test');
  });

  test('should handle empty string', () => {
    const result = slugify('');
    expect(result).toBe('');
  });

  test('should handle numbers and letters', () => {
    const result = slugify('Test 123 ABC');
    expect(result).toBe('test-123-abc');
  });

  test('should handle already slugified text', () => {
    const result = slugify('already-slugified-text');
    expect(result).toBe('already-slugified-text');
  });

  test('should handle unicode characters', () => {
    const result = slugify('Café münü naïve');
    expect(result).toBe('caf-mn-nave');
  });

  test('should trim whitespace', () => {
    const result = slugify('  Hello World  ');
    expect(result).toBe('hello-world');
  });

  test('should collapse multiple dashes', () => {
    const result = slugify('Hello---World');
    expect(result).toBe('hello-world');
  });

  test('should handle mixed case input', () => {
    const result = slugify('CamelCaseText Example');
    expect(result).toBe('camelcasetext-example');
  });
});