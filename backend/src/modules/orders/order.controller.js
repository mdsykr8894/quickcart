const { successResponse } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const orderService = require('./order.service');

/**
 * Controller to execute simulated shopper Checkout.
 */
const checkout = asyncHandler(async (req, res) => {
  const order = await orderService.checkout(req.user.id, req.body, req);
  return successResponse(res, 'Checkout completed successfully. Order placed.', order, 201);
});

/**
 * Controller to fetch the active customer's order history list.
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const data = await orderService.getMyOrders(req.user.id, req.query);
  return successResponse(res, 'User orders retrieved successfully.', data);
});

/**
 * Controller to fetch a specific shopper's order details by ID. (IDOR protected)
 */
const getMyOrderDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await orderService.getMyOrderById(req.user.id, id);
  return successResponse(res, 'Order details retrieved successfully.', order);
});

/**
 * Controller to list all database orders. (Admin only)
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const data = await orderService.getAllOrders(req.query);
  return successResponse(res, 'All orders retrieved successfully.', data);
});

/**
 * Controller to query detail information of any order by ID. (Admin only)
 */
const getOrderDetailForAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await orderService.getOrderByIdForAdmin(id);
  return successResponse(res, 'Order details retrieved successfully.', order);
});

/**
 * Controller to modify the status parameter of an order by ID. (Admin only)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(id, status, req.user.id, req);
  return successResponse(res, 'Order status updated successfully.', order);
});

module.exports = {
  checkout,
  getMyOrders,
  getMyOrderDetail,
  getAllOrders,
  getOrderDetailForAdmin,
  updateOrderStatus
};
