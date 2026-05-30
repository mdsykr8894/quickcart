const prisma = require('../../config/prisma');
const { sanitizeProduct } = require('../../utils/productSanitizer');
const { logAudit } = require('../../utils/auditLogger');
const AppError = require('../../utils/AppError');

/**
 * Retrieves the shopper cart items.
 * Filters out inactive products and computes subtotals, sum totals, and item counts.
 * 
 * @param {string} userId - Shopper user ID
 * @returns {Promise<object>} Compiled shopping cart payload
 */
const getCart = async (userId) => {
  // Fetch cart items belonging strictly to the user, where the mapped product is active
  const cartItems = await prisma.cartItem.findMany({
    where: {
      userId,
      product: {
        isActive: true
      }
    },
    include: {
      product: {
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      }
    }
  });

  let cartTotal = 0.0;
  let totalItemsCount = 0;

  // Map database entries, calculate item subtotals, and compile overall aggregates
  const formattedItems = cartItems.map((item) => {
    const sanitizedProduct = sanitizeProduct(item.product);
    const subtotal = item.quantity * sanitizedProduct.price;

    cartTotal += subtotal;
    totalItemsCount += item.quantity;

    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      subtotal: Number(subtotal.toFixed(2)),
      product: sanitizedProduct,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  });

  return {
    items: formattedItems,
    cartTotal: Number(cartTotal.toFixed(2)),
    totalItemsCount
  };
};

/**
 * Adds an item to the shopper cart.
 * If the product is already in the cart, increments the quantity.
 * Enforces product existence, active status, stock availability, and maximum bounds.
 * 
 * @param {string} userId - Shopper user ID
 * @param {object} data - Validated add cart item details
 * @param {object} req - Express request context
 * @returns {Promise<object>} Updated shopper cart payload
 */
const addItemToCart = async (userId, data, req) => {
  const { productId, quantity } = data;

  // 1. Resolve product details
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  // 2. Validate product status and available stock
  if (!product.isActive) {
    throw new AppError('Product is no longer available.', 400);
  }

  if (product.stock <= 0) {
    throw new AppError('Product is out of stock.', 400);
  }

  if (quantity > product.stock) {
    throw new AppError(`Cannot add more than available stock (${product.stock} items).`, 400);
  }

  // 3. Resolve duplicate cart item entries for the shopper
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: { userId, productId }
    }
  });

  let finalQuantity = quantity;
  if (existingItem) {
    finalQuantity = existingItem.quantity + quantity;
    
    if (finalQuantity > product.stock) {
      throw new AppError(`Requested quantity plus existing cart quantity (${finalQuantity}) exceeds available stock (${product.stock} items).`, 400);
    }

    // Increment existing shopping cart quantity
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: finalQuantity }
    });
  } else {
    // Create new shopping cart record
    await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity: finalQuantity
      }
    });
  }

  // 4. Log successful audit event
  await logAudit({
    userId,
    action: 'CART_ITEM_ADDED',
    status: 'SUCCESS',
    req,
    details: `Product "${product.name}" added/incremented in cart. Added: ${quantity}, Final Qty: ${finalQuantity}.`
  });

  // 5. Yield refreshed shopper cart details
  return getCart(userId);
};

/**
 * Modifies the quantity of an existing cart item.
 * Enforces ownership checks and available catalog stock bounds.
 * 
 * @param {string} userId - Shopper user ID
 * @param {string} cartItemId - Cart item UUID ID
 * @param {object} data - Validated quantity update values
 * @param {object} req - Express request context
 * @returns {Promise<object>} Updated shopper cart payload
 */
const updateCartItem = async (userId, cartItemId, data, req) => {
  const { quantity } = data;

  // 1. Resolve item, checking BOTH ID and userId in one query to completely prevent IDOR
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      userId
    },
    include: {
      product: true
    }
  });

  if (!cartItem) {
    throw new AppError('Cart item not found.', 404);
  }

  const product = cartItem.product;

  // 2. Validate product status and available stock
  if (!product.isActive) {
    throw new AppError('Product is no longer available.', 400);
  }

  if (quantity > product.stock) {
    throw new AppError(`Cannot update quantity. Only ${product.stock} items available in stock.`, 400);
  }

  // 3. Update quantity
  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity }
  });

  // 4. Log successful audit event
  await logAudit({
    userId,
    action: 'CART_ITEM_UPDATED',
    status: 'SUCCESS',
    req,
    details: `Cart item for "${product.name}" updated from Qty ${cartItem.quantity} to ${quantity}.`
  });

  return getCart(userId);
};

/**
 * Deletes a single item from the shopper cart.
 * Enforces ownership checks to prevent unauthorized removals.
 * 
 * @param {string} userId - Shopper user ID
 * @param {string} cartItemId - Cart item UUID ID
 * @param {object} req - Express request context
 * @returns {Promise<object>} Updated shopper cart payload
 */
const removeCartItem = async (userId, cartItemId, req) => {
  // 1. Resolve cart item (enforcing double-parameter query to block IDOR)
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      userId
    },
    include: {
      product: true
    }
  });

  if (!cartItem) {
    throw new AppError('Cart item not found.', 404);
  }

  // 2. Delete item
  await prisma.cartItem.delete({
    where: { id: cartItemId }
  });

  // 3. Log successful audit event
  await logAudit({
    userId,
    action: 'CART_ITEM_REMOVED',
    status: 'SUCCESS',
    req,
    details: `Product "${cartItem.product.name}" removed from shopper cart.`
  });

  return getCart(userId);
};

/**
 * Empties all cart items belonging to the shopper.
 * 
 * @param {string} userId - Shopper user ID
 * @param {object} req - Express request context
 * @returns {Promise<object>} Empty cart payload
 */
const clearCart = async (userId, req) => {
  // Delete all cart entries for the user only
  const { count } = await prisma.cartItem.deleteMany({
    where: { userId }
  });

  if (count > 0) {
    await logAudit({
      userId,
      action: 'CART_CLEARED',
      status: 'SUCCESS',
      req,
      details: `Cleared all ${count} items from shopper cart.`
    });
  }

  return {
    items: [],
    cartTotal: 0.0,
    totalItemsCount: 0
  };
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
