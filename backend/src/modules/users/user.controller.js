const { successResponse } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const userService = require('./user.service');

/**
 * Controller to fetch the active shopper profile.
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  return successResponse(res, 'User profile retrieved successfully.', user);
});

/**
 * Controller to modify parameters of the active shopper profile.
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body, req);
  return successResponse(res, 'User profile updated successfully.', user);
});

/**
 * Controller to list all user profiles in the system (Restricted to Admins).
 */
const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  return successResponse(res, 'Users list retrieved successfully.', users);
});

/**
 * Controller to query detail information of any user profile by ID (Restricted to Admins).
 */
const getUserDetail = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return successResponse(res, 'User details retrieved successfully.', user);
});

module.exports = {
  getProfile,
  updateProfile,
  listUsers,
  getUserDetail
};
