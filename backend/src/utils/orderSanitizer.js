const { sanitizeUser } = require('./sanitize');

/**
 * Sanitizes an order object before sending it to clients.
 * Converts Decimal price fields to float numbers, formats public image URLs,
 * and sanitizes associated User profiles.
 * 
 * @param {object} order - Raw database order record
 * @returns {object} Clean, sanitized order object
 */
const sanitizeOrder = (order) => {
  if (!order) return null;

  const sanitized = {
    id: order.id,
    userId: order.userId,
    status: order.status,
    totalAmount: order.totalAmount ? Number(order.totalAmount) : 0.0,
    fullName: order.fullName,
    phone: order.phone,
    addressLine1: order.addressLine1,
    addressLine2: order.addressLine2,
    city: order.city,
    state: order.state,
    postalCode: order.postalCode,
    country: order.country || 'Malaysia',
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };

  // Format order item list snapshots safely
  if (order.items) {
    sanitized.items = order.items.map((item) => {
      // Robust image resolving logic
      let imageUrl = null;
      if (item.product) {
        const product = item.product;
        if (Array.isArray(product.images) && product.images.length > 0) {
          const img = product.images[0];
          if (img.imageUrl) imageUrl = img.imageUrl;
          else if (img.url) imageUrl = img.url;
          else if (img.imageName) imageUrl = `http://localhost:5001/uploads/products/${img.imageName}`;
          else if (img.imagePath) {
            const baseName = require('path').basename(img.imagePath);
            imageUrl = `http://localhost:5001/uploads/products/${baseName}`;
          }
        }
        
        if (!imageUrl && product.imageUrl) imageUrl = product.imageUrl;
        if (!imageUrl && product.imageName) imageUrl = `http://localhost:5001/uploads/products/${product.imageName}`;
        if (!imageUrl && product.imagePath) {
          const baseName = require('path').basename(product.imagePath);
          imageUrl = `http://localhost:5001/uploads/products/${baseName}`;
        }
      }

      if (!imageUrl && item.imageUrl) imageUrl = item.imageUrl;

      const itemSanitized = {
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productSlug: item.product ? item.product.slug : null,
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : 0.0,
        subtotal: item.subtotal ? Number(item.subtotal) : 0.0,
        imageUrl: imageUrl,
        createdAt: item.createdAt,
        product: {
          id: item.product ? item.product.id : item.productId,
          slug: item.product ? item.product.slug : null,
          name: item.productName,
          imageUrl: imageUrl
        }
      };

      return itemSanitized;
    });
  }

  // Sanitize customer profiles (Admin operations)
  if (order.user) {
    sanitized.user = sanitizeUser(order.user);
  }

  return sanitized;
};

/**
 * Sanitizes an array of order objects.
 * @param {Array} orders - Raw database orders list
 * @returns {Array} Sanitized orders list
 */
const sanitizeOrders = (orders) => {
  if (!Array.isArray(orders)) return [];
  return orders.map(sanitizeOrder);
};

module.exports = {
  sanitizeOrder,
  sanitizeOrders
};
