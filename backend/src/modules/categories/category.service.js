const prisma = require('../../config/prisma');

/**
 * Service to retrieve product categories sorted alphabetically by name.
 * Includes a cumulative count of catalog products classified under each category.
 * 
 * @returns {Promise<Array>} Category records list
 */
const getCategories = async () => {
  return prisma.category.findMany({
    orderBy: {
      name: 'asc'
    },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
};

module.exports = {
  getCategories
};
