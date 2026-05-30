const { successResponse } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const cartService = require('./cart.service');

/**
 * Controller to fetch the active shopper's shopping cart.
 */
const getCart = asyncHandler(async (req, res) => {
  const data = await cartService.getCart(req.user.id);
  return successResponse(res, 'Shopping cart retrieved successfully.', data);
});

/**
 * Controller to add a product to the shopper's cart.
 */
const addCartItem = asyncHandler(async (req, res) => {
  const data = await cartService.addItemToCart(req.user.id, req.body, req);
  return successResponse(res, 'Item added to shopping cart successfully.', data);
});

/**
 * Controller to update a shopping cart item quantity by UUID.
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await cartService.updateCartItem(req.user.id, id, req.body, req);
  return successResponse(res, 'Shopping cart item updated successfully.', data);
});

/**
 * Controller to remove a product from the shopper's cart by UUID.
 */
const removeCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await cartService.removeCartItem(req.user.id, id, req);
  return successResponse(res, 'Item removed from shopping cart successfully.', data);
});

/**
 * Controller to completely empty the shopper's cart.
 */
const clearCart = asyncHandler(async (req, res) => {
  const data = await cartService.clearCart(req.user.id, req);
  return successResponse(res, 'Shopping cart cleared successfully.', data);
});

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart
};
