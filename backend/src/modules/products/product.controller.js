const { successResponse } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const productService = require('./product.service');

/**
 * Controller to list public products.
 * Handles sorting, search string checks, category filters, and pagination queries.
 */
const listProducts = asyncHandler(async (req, res) => {
  const data = await productService.getPublicProducts(req.query);
  return successResponse(res, 'Products retrieved successfully.', data);
});

/**
 * Controller to query detail specifications of a product by slug or UUID.
 */
const getProductDetail = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const product = await productService.getProductByIdOrSlug(idOrSlug);
  return successResponse(res, 'Product details retrieved successfully.', product);
});

/**
 * Controller to create a new product entry in catalog. (Admin only)
 */
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user.id, req);
  return successResponse(res, 'Product created successfully.', product, 201);
});

/**
 * Controller to modify parameters of an existing product entry. (Admin only)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.updateProduct(id, req.body, req.user.id, req);
  return successResponse(res, 'Product updated successfully.', product);
});

/**
 * Controller to soft delete a product catalog entry. (Admin only)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await productService.softDeleteProduct(id, req.user.id, req);
  return successResponse(res, 'Product deleted successfully.', result);
});

/**
 * Controller to upload and map an image file to a product catalog entry. (Admin only)
 */
const uploadProductImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.uploadProductImage(id, req.file, req.user.id, req);
  return successResponse(res, 'Product image uploaded successfully.', product);
});

/**
 * Controller to upload and map multiple image files to a product catalog entry. (Admin only)
 */
const uploadProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.uploadProductImages(id, req.files, req.user.id, req);
  return successResponse(res, 'Product images uploaded successfully.', product);
});

/**
 * Controller to delete an individual product image. (Admin only)
 */
const deleteProductImage = asyncHandler(async (req, res) => {
  const { productId, imageId } = req.params;
  const product = await productService.deleteProductImage(productId, imageId, req.user.id, req);
  return successResponse(res, 'Product image deleted successfully.', product);
});

module.exports = {
  listProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  uploadProductImages,
  deleteProductImage
};
