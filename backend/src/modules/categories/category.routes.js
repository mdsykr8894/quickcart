const express = require('express');
const categoryController = require('./category.controller');

const router = express.Router();

// Public endpoint to query categories (unauthenticated)
router.get('/', categoryController.listCategories);

module.exports = router;
