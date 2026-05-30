const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const validate = require('../../middleware/validate.middleware');
const { createProductSchema, updateProductSchema } = require('./product.validation');
const { productImageUpload, productImagesUpload } = require('../../middleware/upload.middleware');
const productController = require('./product.controller');

const router = express.Router();

// Public catalog routes (Unauthenticated access permitted)
router.get('/', productController.listProducts);
router.get('/:idOrSlug', productController.getProductDetail);

// Administrative route shields (Authentication and ADMIN privilege checks required)
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

// Route to create a new product entry
router.post('/', validate(createProductSchema), productController.createProduct);

// Route to update product details by UUID
router.patch('/:id', validate(updateProductSchema), productController.updateProduct);

// Route to soft delete a product by UUID
router.delete('/:id', productController.deleteProduct);

// Route to upload and map product image file (Multer parsed, UUID randomized)
router.post('/:id/image', productImageUpload, productController.uploadProductImage);

// Route to upload multiple images for a product (up to 4)
router.post('/:id/images', productImagesUpload, productController.uploadProductImages);

// Route to delete a single image from a product
router.delete('/:productId/images/:imageId', productController.deleteProductImage);

module.exports = router;
