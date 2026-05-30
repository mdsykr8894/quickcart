/**
 * Sanitizes a product object before sending it to clients.
 * Strips internal server fields like `imagePath` and converts Prisma Decimal objects to standard numbers.
 * 
 * @param {object} product - Raw product database model
 * @returns {object} Cleaned product object
 */
const sanitizeProduct = (product) => {
  if (!product) return null;

  const images = Array.isArray(product.images)
    ? product.images.map((img) => ({
        id: img.id,
        url: `http://localhost:5001/uploads/products/${img.imageName}`,
        imageName: img.imageName,
        sortOrder: img.sortOrder
      }))
    : [];

  const imageUrl = images.length > 0
    ? images[0].url
    : (product.imageName ? `http://localhost:5001/uploads/products/${product.imageName}` : null);

  const sanitized = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price ? Number(product.price) : 0.0,
    stock: product.stock,
    imageName: product.imageName,
    imageMime: product.imageMime,
    imageUrl,
    images,
    isActive: product.isActive,
    categoryId: product.categoryId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };

  // Embed categorized relation details if populated
  if (product.category) {
    sanitized.category = {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
      description: product.category.description
    };
  }

  return sanitized;
};

/**
 * Sanitizes an array of product objects.
 * @param {Array} products - Raw database products list
 * @returns {Array} Sanitized products list
 */
const sanitizeProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(sanitizeProduct);
};

module.exports = {
  sanitizeProduct,
  sanitizeProducts
};
