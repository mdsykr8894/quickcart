const { successResponse } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const settingsService = require('./settings.service');

/**
 * Controller to fetch global development settings specifications.
 */
const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings();
  return successResponse(res, 'Development settings retrieved successfully.', settings);
});

/**
 * Controller to update the Swagger enabled configurations setting. (Admin only)
 */
const updateSwaggerSetting = asyncHandler(async (req, res) => {
  const { swaggerEnabled } = req.body;
  const settings = await settingsService.updateSwaggerSetting(swaggerEnabled, req.user.id, req);
  return successResponse(res, 'Swagger settings updated successfully.', settings);
});

module.exports = {
  getSettings,
  updateSwaggerSetting
};
