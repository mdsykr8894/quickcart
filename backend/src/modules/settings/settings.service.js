const prisma = require('../../config/prisma');
const env = require('../../config/env');
const { logAudit } = require('../../utils/auditLogger');
const AppError = require('../../utils/AppError');

/**
 * Retrieves the current system development settings.
 * Pulls from the database AppSetting model, using the env configuration as fallback.
 * 
 * @returns {Promise<object>} Safe settings specifications payload
 */
const getSettings = async () => {
  // Query SWAGGER_ENABLED from database AppSetting
  let setting = await prisma.appSetting.findUnique({
    where: { key: 'SWAGGER_ENABLED' }
  });

  // If missing, initialize it from environment configurations
  if (!setting) {
    setting = await prisma.appSetting.create({
      data: {
        key: 'SWAGGER_ENABLED',
        value: String(env.SWAGGER_ENABLED)
      }
    });
  }

  const swaggerEnabled = setting.value === 'true';
  const nodeEnv = env.NODE_ENV;
  
  // Swagger is only active when in development and enabled by admin
  const swaggerAvailable = nodeEnv === 'development' && swaggerEnabled;

  return {
    swaggerEnabled,
    nodeEnv,
    swaggerAvailable
  };
};

/**
 * Modifies the SWAGGER_ENABLED app setting toggle.
 * Restricts updates to development environments.
 * 
 * @param {boolean} enabled - Target state of Swagger documentation
 * @param {string} adminUserId - Authenticated Administrator user ID
 * @param {object} req - Express request context
 * @returns {Promise<object>} Updated settings specifications payload
 */
const updateSwaggerSetting = async (enabled, adminUserId, req) => {
  // Restrict modification to development environment only (Security Gate)
  if (env.NODE_ENV !== 'development') {
    throw new AppError('Development settings are not available in production.', 403);
  }

  const valueString = String(enabled);

  // Update or insert setting row in database
  await prisma.appSetting.upsert({
    where: { key: 'SWAGGER_ENABLED' },
    update: { value: valueString },
    create: { key: 'SWAGGER_ENABLED', value: valueString }
  });

  // Log administrative audit event
  await logAudit({
    userId: adminUserId,
    action: 'SWAGGER_SETTING_UPDATED',
    status: 'SUCCESS',
    req,
    details: `Swagger runtime setting modified to enabled: ${enabled}.`
  });

  return getSettings();
};

module.exports = {
  getSettings,
  updateSwaggerSetting
};
