const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');
const AppError = require('../utils/AppError');

// Configure disk storage with secure random filenames, fully discarding raw client filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/products'));
  },
  filename: (req, file, cb) => {
    const secureId = crypto.randomUUID();
    const fileExtension = path.extname(file.originalname).toLowerCase();
    cb(null, `${secureId}${fileExtension}`);
  }
});

// Configure strict extension and MIME-type filters to block script or executable uploads
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const extension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (!allowedExtensions.includes(extension)) {
    return cb(new AppError('Invalid file extension. Only .jpg, .jpeg, .png, and .webp images are permitted.', 400), false);
  }

  if (!allowedMimeTypes.includes(mimeType)) {
    return cb(new AppError('Invalid file content type. Only JPEG, PNG, and WebP images are allowed.', 400), false);
  }

  cb(null, true);
};

// Standard Multer configuration boundary parameters
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: env.UPLOAD_MAX_SIZE_MB * 1024 * 1024 // Convert Megabytes to Bytes
  }
});

// Single field image uploader middleware wrapper to intercept size boundaries or parsing faults gracefully
const productImageUpload = (req, res, next) => {
  const singleHandler = upload.single('image');

  singleHandler(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError(`File exceeds maximum size boundary limit of ${env.UPLOAD_MAX_SIZE_MB}MB.`, 400));
        }
        return next(new AppError(`Upload error: ${err.message}`, 400));
      }
      return next(err); // Passes custom AppError from fileFilter or other exceptions
    }
    next();
  });
};

// Multi field image uploader middleware wrapper for up to 4 images
const productImagesUpload = (req, res, next) => {
  const arrayHandler = upload.array('images', 4);

  arrayHandler(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError(`One or more files exceed the maximum size boundary limit of ${env.UPLOAD_MAX_SIZE_MB}MB.`, 400));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError('Maximum of 4 product images is permitted.', 400));
        }
        return next(new AppError(`Upload error: ${err.message}`, 400));
      }
      return next(err); // Passes custom AppError from fileFilter or other exceptions
    }
    next();
  });
};

// Configure disk storage for user profiles with secure random filenames
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/profiles'));
  },
  filename: (req, file, cb) => {
    const secureId = crypto.randomUUID();
    const fileExtension = path.extname(file.originalname).toLowerCase();
    cb(null, `${secureId}${fileExtension}`);
  }
});

const uploadProfiles = multer({
  storage: profileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: env.UPLOAD_MAX_SIZE_MB * 1024 * 1024
  }
});

// Single field profile image uploader middleware wrapper
const profileImageUpload = (req, res, next) => {
  const singleHandler = uploadProfiles.single('image');

  singleHandler(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError(`File exceeds maximum size boundary limit of ${env.UPLOAD_MAX_SIZE_MB}MB.`, 400));
        }
        return next(new AppError(`Upload error: ${err.message}`, 400));
      }
      return next(err); // Passes custom AppError from fileFilter or other exceptions
    }
    next();
  });
};

module.exports = {
  productImageUpload,
  productImagesUpload,
  profileImageUpload
};
