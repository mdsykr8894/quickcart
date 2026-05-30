const { successResponse } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const categoryService = require('./category.service');

/**
 * Controller to fetch all catalog categories.
 */
const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories();

  // Map category data and format product count properties cleanly
  const formattedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    productCount: cat._count ? cat._count.products : 0
  }));

  return successResponse(res, 'Categories retrieved successfully.', formattedCategories);
});

module.exports = {
  listCategories
};
