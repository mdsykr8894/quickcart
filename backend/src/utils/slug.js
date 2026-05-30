/**
 * Converts a text string (e.g. product or category name) into a URL-safe lowercase slug.
 * Replaces spaces and non-alphanumeric characters with hyphens and trims duplicate hyphens.
 * 
 * @param {string} text - Raw string
 * @returns {string} URL-safe slug
 */
const createSlug = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except spaces and hyphens
    .replace(/\s+/g, '-')         // Convert spaces to single hyphens
    .replace(/-+/g, '-')          // Convert duplicate hyphens to single hyphens
    .replace(/^-+|-+$/g, '');     // Trim leading and trailing hyphens
};

module.exports = {
  createSlug
};
