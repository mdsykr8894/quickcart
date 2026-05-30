const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const prisma = require('../../config/prisma');
const { createSlug } = require('../../utils/slug');
const { sanitizeProduct, sanitizeProducts } = require('../../utils/productSanitizer');
const { logAudit } = require('../../utils/auditLogger');
const AppError = require('../../utils/AppError');

/**
 * Lists public products with optional search, category, sorting, and pagination filters.
 * Returns only active products (isActive: true) by default.
 * 
 * @param {object} query - Query parameters
 * @returns {Promise<object>} Paginated sanitized products list
 */
const getPublicProducts = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Public catalogs display only active items
  const where = {
    isActive: true
  };

  // Add search term filter (case-insensitive contains matches in name or description)
  if (query.search) {
    const searchString = String(query.search);
    where.OR = [
      { name: { contains: searchString, mode: 'insensitive' } },
      { description: { contains: searchString, mode: 'insensitive' } }
    ];
  }

  // Add category filters (can resolve by categorySlug or category UUID)
  if (query.category) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query.category);
    if (isUUID) {
      where.categoryId = query.category;
    } else {
      where.category = { slug: query.category };
    }
  }

  // Determine sort order
  let orderBy = { createdAt: 'desc' }; // default newest
  if (query.sort) {
    switch (query.sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } }
      }
    }),
    prisma.product.count({ where })
  ]);

  return {
    products: sanitizeProducts(products),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Fetches a single active product by UUID ID or URL Slug.
 * 
 * @param {string} idOrSlug - UUID ID or slug string
 * @returns {Promise<object>} Sanitized product record
 */
const getProductByIdOrSlug = async (idOrSlug) => {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  const where = {
    ...(isUUID ? { id: idOrSlug } : { slug: idOrSlug })
  };

  const product = await prisma.product.findFirst({
    where,
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } }
    }
  });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  return sanitizeProduct(product);
};

/**
 * Creates a new product. (Admin only)
 * 
 * @param {object} data - Validated product payload
 * @param {string} adminUserId - Authenticated Administrator user ID
 * @param {object} req - Express request context
 * @returns {Promise<object>} Sanitized new product
 */
const createProduct = async (data, adminUserId, req) => {
  const { name, description, price, stock, categoryId, isActive = true } = data;

  // 1. Confirm category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  if (!category) {
    throw new AppError('Invalid category ID. Category not found.', 400);
  }

  // 2. Generate and resolve slug collisions
  let slug = createSlug(name);
  const duplicateSlug = await prisma.product.findUnique({
    where: { slug }
  });
  
  if (duplicateSlug) {
    const randomSuffix = crypto.randomBytes(2).toString('hex');
    slug = `${slug}-${randomSuffix}`;
  }

  // 3. Persist product record
  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      stock,
      categoryId,
      isActive
    },
    include: { category: true }
  });

  // 4. Log admin audit event
  await logAudit({
    userId: adminUserId,
    action: 'PRODUCT_CREATED',
    status: 'SUCCESS',
    req,
    details: `Product "${product.name}" created under category "${category.name}".`
  });

  return sanitizeProduct(product);
};

/**
 * Modifies an existing product catalog entry. (Admin only)
 * 
 * @param {string} id - Product UUID ID
 * @param {object} data - Validated update values
 * @param {string} adminUserId - Authenticated Administrator user ID
 * @param {object} req - Express request context
 * @returns {Promise<object>} Updated sanitized product
 */
const updateProduct = async (id, data, adminUserId, req) => {
  const { name, description, price, stock, categoryId, isActive } = data;

  const product = await prisma.product.findUnique({
    where: { id }
  });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  const updateData = {};
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = price;
  if (stock !== undefined) updateData.stock = stock;
  if (isActive !== undefined) updateData.isActive = isActive;

  // Validate category if modified
  if (categoryId !== undefined && categoryId !== product.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      throw new AppError('Invalid category ID. Category not found.', 400);
    }
    updateData.categoryId = categoryId;
  }

  // Regenerate slug if catalog name is updated, resolving collisions
  if (name !== undefined && name !== product.name) {
    let slug = createSlug(name);
    const duplicateSlug = await prisma.product.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });

    if (duplicateSlug) {
      const randomSuffix = crypto.randomBytes(2).toString('hex');
      slug = `${slug}-${randomSuffix}`;
    }

    updateData.name = name;
    updateData.slug = slug;
  }

  if (Object.keys(updateData).length === 0) {
    return sanitizeProduct(product);
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateData,
    include: { category: true }
  });

  // Log admin audit event
  await logAudit({
    userId: adminUserId,
    action: 'PRODUCT_UPDATED',
    status: 'SUCCESS',
    req,
    details: `Product "${product.name}" updated fields: [${Object.keys(updateData).join(', ')}]`
  });

  return sanitizeProduct(updatedProduct);
};

/**
 * Soft deletes a product catalog entry. (Admin only)
 * 
 * @param {string} id - Product UUID ID
 * @param {string} adminUserId - Authenticated Administrator user ID
 * @param {object} req - Express request context
 * @returns {Promise<object>} Success status
 */
const softDeleteProduct = async (id, adminUserId, req) => {
  const product = await prisma.product.findUnique({
    where: { id }
  });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  // Soft delete toggles isActive to false, protecting historical transactional orders
  await prisma.product.update({
    where: { id },
    data: {
      isActive: false
    }
  });

  // Log admin audit event
  await logAudit({
    userId: adminUserId,
    action: 'PRODUCT_DELETED',
    status: 'SUCCESS',
    req,
    details: `Product "${product.name}" soft deleted.`
  });

  return { message: 'Product soft deleted successfully.' };
};

/**
 * Binds locally uploaded image metadata to a product entry. (Admin only)
 * 
 * @param {string} id - Product UUID ID
 * @param {object} file - Uploaded Multer file structure
 * @param {string} adminUserId - Authenticated Administrator user ID
 * @param {object} req - Express request context
 * @returns {Promise<object>} Sanitized product with image parameters
 */
const uploadProductImage = async (id, file, adminUserId, req) => {
  if (!file) {
    throw new AppError('Image file is required.', 400);
  }

  const product = await prisma.product.findUnique({
    where: { id }
  });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      imageName: file.filename,
      imagePath: file.path,
      imageMime: file.mimetype
    },
    include: { category: true, images: { orderBy: { sortOrder: 'asc' } } }
  });

  // Log admin audit event
  await logAudit({
    userId: adminUserId,
    action: 'PRODUCT_IMAGE_UPLOADED',
    status: 'SUCCESS',
    req,
    details: `Product "${product.name}" image uploaded: stored name "${file.filename}".`
  });

  return sanitizeProduct(updatedProduct);
};

/**
 * Binds multiple locally uploaded image files to a product entry, appending to previous ones. (Admin only)
 * 
 * @param {string} id - Product UUID ID
 * @param {Array} files - Uploaded Multer files array
 * @param {string} adminUserId - Authenticated Administrator user ID
 * @param {object} req - Express request context
 * @returns {Promise<object>} Sanitized product with all images
 */
const uploadProductImages = async (id, files, adminUserId, req) => {
  if (!files || files.length === 0) {
    throw new AppError('At least one image file is required.', 400);
  }

  const product = await prisma.product.findUnique({
    where: { id }
  });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  // 1. Count existing ProductImage rows for the product
  const existingCount = await prisma.productImage.count({
    where: { productId: id }
  });

  const totalCount = existingCount + files.length;
  if (totalCount > 4) {
    throw new AppError(`Maximum 4 images per product. This product already has ${existingCount} image${existingCount !== 1 ? 's' : ''}.`, 400);
  }

  // 2. Insert new ProductImage records with sortOrder continuing from existingCount
  const imageCreatePromises = files.map((file, index) => {
    return prisma.productImage.create({
      data: {
        productId: id,
        imageName: file.filename,
        imagePath: file.path,
        imageMime: file.mimetype,
        sortOrder: existingCount + index
      }
    });
  });
  await Promise.all(imageCreatePromises);

  // 3. Retrieve complete updated model
  const updatedProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } }
    }
  });

  // Log admin audit event
  await logAudit({
    userId: adminUserId,
    action: 'PRODUCT_IMAGES_UPLOADED',
    status: 'SUCCESS',
    req,
    details: `Product "${product.name}" multi-images uploaded: ${files.length} images stored.`
  });

  return sanitizeProduct(updatedProduct);
};

/**
 * Deletes a specific product image, unlinks it on disk, and reorders remaining images. (Admin only)
 * 
 * @param {string} productId - Product UUID ID
 * @param {string} imageId - Image UUID ID
 * @param {string} adminUserId - Authenticated Administrator user ID
 * @param {object} req - Express request context
 * @returns {Promise<object>} Sanitized product with all remaining images
 */
const deleteProductImage = async (productId, imageId, adminUserId, req) => {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  const image = await prisma.productImage.findUnique({
    where: { id: imageId }
  });
  if (!image) {
    throw new AppError('Product image not found.', 404);
  }

  if (image.productId !== productId) {
    throw new AppError('Product image does not belong to this product.', 400);
  }

  // 1. Safely unlink image file from disk
  if (image.imagePath) {
    try {
      if (fs.existsSync(image.imagePath)) {
        fs.unlinkSync(image.imagePath);
      }
    } catch (err) {
      console.error(`Failed to delete file at ${image.imagePath}:`, err);
    }
  }

  // 2. Delete the ProductImage row
  await prisma.productImage.delete({
    where: { id: imageId }
  });

  // 3. Reorder remaining images so sortOrder becomes 0, 1, 2, 3
  const remainingImages = await prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: 'asc' }
  });

  for (let i = 0; i < remainingImages.length; i++) {
    await prisma.productImage.update({
      where: { id: remainingImages[i].id },
      data: { sortOrder: i }
    });
  }

  // 4. Retrieve complete updated model
  const updatedProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } }
    }
  });

  // Log admin audit event
  await logAudit({
    userId: adminUserId,
    action: 'PRODUCT_IMAGE_DELETED',
    status: 'SUCCESS',
    req,
    details: `Product "${product.name}" image "${image.imageName}" deleted individually.`
  });

  return sanitizeProduct(updatedProduct);
};

module.exports = {
  getPublicProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  softDeleteProduct,
  uploadProductImage,
  uploadProductImages,
  deleteProductImage
};
