export function slugify(text) {
  if (!text || typeof text !== 'string') {
    return 'untitled';
  }
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')  // Remove invalid chars
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/-+/g, '-')          // Collapse multiple -
    .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
    || 'untitled';                // Fallback if result is empty
}
