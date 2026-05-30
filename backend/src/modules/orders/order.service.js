const prisma = require('../../config/prisma');
const { sanitizeOrder, sanitizeOrders } = require('../../utils/orderSanitizer');
const { logAudit } = require('../../utils/auditLogger');
const AppError = require('../../utils/AppError');

const resolveOrderItemStaleConflicts = async (orderOrOrders) => {
  if (!orderOrOrders) return orderOrOrders;

  const activeProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  const processOrder = (order) => {
    if (!order || !order.items) return order;
    order.items = order.items.map(item => {
      if (item.product) {
        const hasOwnImages = (Array.isArray(item.product.images) && item.product.images.length > 0) || item.product.imageName;
        const match = activeProducts.find(p => p.name.toLowerCase() === item.product.name.toLowerCase());
        if (match) {
          if (!hasOwnImages && match.images && match.images.length > 0) {
            item.product.images = match.images;
          }
          item.product.slug = match.slug;
        }
      }
      return item;
    });
    return order;
  };

  if (Array.isArray(orderOrOrders)) {
    return orderOrOrders.map(processOrder);
  } else {
    return processOrder(orderOrOrders);
  }
};

/**
 * Executes a simulated Checkout transaction.
 * Creates an Order and OrderItems, decrements product stock counts, and empties the shopper cart.
 * Executed inside a single atomic SQL transaction to prevent half-finished anomalies.
 * 
 * @param {string} userId - Shopper user ID
 * @param {object} data - Validated billing shipping metadata
 * @param {object} req - Express request context
 * @returns {Promise<object>} Sanitized checkout Order payload
 */
const checkout = async (userId, data, req) => {
  // 1. Fetch shopper cart items
  const cartItems = await prisma.cartItem.findMany({
    where: {
      userId,
      product: { isActive: true }
    },
    include: {
      product: true
    }
  });

  if (cartItems.length === 0) {
    throw new AppError('Cannot checkout. Your shopping cart is empty.', 400);
  }

  // 2. Calculate totalAmount and perform initial validation (pre-check)
  let totalAmount = 0.0;
  for (const item of cartItems) {
    const product = item.product;
    
    if (!product.isActive) {
      throw new AppError(`Product "${product.name}" is no longer active. Please remove it from your cart.`, 400);
    }

    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for product "${product.name}". Only ${product.stock} items remaining in stock.`, 400);
    }
    
    totalAmount += item.quantity * Number(product.price);
  }

  // 3. Execute atomic SQL Transaction pool
  const createdOrder = await prisma.$transaction(async (tx) => {
    // A. Persist main Order billing receipt
    const order = await tx.order.create({
      data: {
        userId,
        fullName: data.fullName,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'Malaysia',
        totalAmount: totalAmount,
        status: 'PENDING'
      }
    });

    // Also update the User profile with these details as their saved shipping address
    await tx.user.update({
      where: { id: userId },
      data: {
        shippingFullName: data.fullName,
        shippingPhone: data.phone,
        shippingAddressLine1: data.addressLine1,
        shippingAddressLine2: data.addressLine2,
        shippingCity: data.city,
        shippingState: data.state,
        shippingPostalCode: data.postalCode,
        shippingCountry: data.country || 'Malaysia'
      }
    });

    // B. Save item snapshots and decrement catalog stock levels
    for (const item of cartItems) {
      const subtotal = item.quantity * Number(item.product.price);

      // Re-fetch product inside the active transaction context to prevent race conditions
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product || !product.isActive) {
        throw new AppError(`Product "${item.product.name}" is no longer active.`, 400);
      }

      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for product "${product.name}". Only ${product.stock} items remaining in stock.`, 400);
      }

      // Create OrderItem snapshot preserving current prices and name
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          productName: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          subtotal: subtotal
        }
      });

      // Update remaining catalog stocks atomically
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    // C. Wipe user cart records
    await tx.cartItem.deleteMany({
      where: { userId }
    });

    return order;
  });

  // 4. Resolve populated order parameters for sanitization
  const completeOrder = await prisma.order.findUnique({
    where: { id: createdOrder.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: 'asc' }
              }
            }
          }
        }
      }
    }
  });

  // 5. Log successful checkout audit event
  await logAudit({
    userId,
    action: 'ORDER_CREATED',
    status: 'SUCCESS',
    req,
    details: `Order ID ${completeOrder.id} successfully created. Cart cleared and stock decremented. Sum: $${totalAmount.toFixed(2)}.`
  });

  const completeOrderWithConflictFix = await resolveOrderItemStaleConflicts(completeOrder);
  return sanitizeOrder(completeOrderWithConflictFix);
};

/**
 * Lists the authenticated shopper's order history with pagination and status filters.
 * 
 * @param {string} userId - Shopper user ID
 * @param {object} query - Query parameters (page, limit, status)
 * @returns {Promise<object>} Paginated sanitized orders list
 */
const getMyOrders = async (userId, query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const where = { userId };
  if (query.status) {
    where.status = query.status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' }
                }
              }
            }
          }
        }
      }
    }),
    prisma.order.count({ where })
  ]);

  const ordersWithConflictFix = await resolveOrderItemStaleConflicts(orders);
  return {
    orders: sanitizeOrders(ordersWithConflictFix),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Fetches a single shopper order by ID, enforcing user check. (IDOR blocker)
 * 
 * @param {string} userId - Shopper user ID
 * @param {string} orderId - Order UUID ID
 * @returns {Promise<object>} Sanitized order payload
 */
const getMyOrderById = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: 'asc' }
              }
            }
          }
        }
      }
    }
  });

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  const orderWithConflictFix = await resolveOrderItemStaleConflicts(order);
  return sanitizeOrder(orderWithConflictFix);
};

/**
 * Lists all database orders with filters and pagination. (Admin only)
 * 
 * @param {object} query - Query parameters (page, limit, status)
 * @returns {Promise<object>} Paginated sanitized orders list
 */
const getAllOrders = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const where = {};
  if (query.status) {
    where.status = query.status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: true,
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' }
                }
              }
            }
          }
        }
      }
    }),
    prisma.order.count({ where })
  ]);

  const ordersWithConflictFix = await resolveOrderItemStaleConflicts(orders);
  return {
    orders: sanitizeOrders(ordersWithConflictFix),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Fetches any database order by ID. (Admin only)
 * 
 * @param {string} orderId - Order UUID ID
 * @returns {Promise<object>} Sanitized order payload
 */
const getOrderByIdForAdmin = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: 'asc' }
              }
            }
          }
        }
      }
    }
  });

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  const orderWithConflictFix = await resolveOrderItemStaleConflicts(order);
  return sanitizeOrder(orderWithConflictFix);
};

/**
 * Modifies the status parameter of an order. (Admin only)
 * Logs status transitions securely inside the audit trail.
 * 
 * @param {string} orderId - Order UUID ID
 * @param {string} status - New order status enum (PENDING, PROCESSING, COMPLETED, CANCELLED)
 * @param {string} adminUserId - Authenticated Administrator user ID
 * @param {object} req - Express request context
 * @returns {Promise<object>} Updated sanitized order payload
 */
const updateOrderStatus = async (orderId, status, adminUserId, req) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      user: true,
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: 'asc' }
              }
            }
          }
        }
      }
    }
  });

  // Log administrative audit event
  await logAudit({
    userId: adminUserId,
    action: 'ORDER_STATUS_UPDATED',
    status: 'SUCCESS',
    req,
    details: `Order status for transaction ID ${orderId} modified from "${order.status}" to "${status}".`
  });

  const updatedOrderWithConflictFix = await resolveOrderItemStaleConflicts(updatedOrder);
  return sanitizeOrder(updatedOrderWithConflictFix);
};

module.exports = {
  checkout,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  getOrderByIdForAdmin,
  updateOrderStatus
};
