const express = require('express');
const { body } = require('express-validator');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, updateStock } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

router.use(protect);

router.get('/', getProducts);
router.get('/:id', getProduct);

router.post('/', authorize('administrator'), [
  body('name').notEmpty().withMessage('Product name is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('category_id').notEmpty().withMessage('Category is required'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Valid unit price is required'),
  validate
], createProduct);

router.put('/:id', authorize('administrator'), [
  body('name').notEmpty().withMessage('Product name is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('category_id').notEmpty().withMessage('Category is required'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Valid unit price is required'),
  validate
], updateProduct);

router.delete('/:id', authorize('administrator'), deleteProduct);

router.patch('/:id/stock', authorize('administrator'), [
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('operation').isIn(['add', 'subtract']).withMessage('Operation must be add or subtract'),
  validate
], updateStock);

module.exports = router;
