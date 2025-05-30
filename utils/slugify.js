export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')  // Remove invalid chars
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/-+/g, '-');         // Collapse multiple -
}
