const express = require('express');
const { body } = require('express-validator');
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

router.use(protect);

router.get('/', getCategories);
router.get('/:id', getCategory);

router.post('/', authorize('administrator'), [
  body('name').notEmpty().withMessage('Category name is required'),
  validate
], createCategory);

router.put('/:id', authorize('administrator'), [
  body('name').notEmpty().withMessage('Category name is required'),
  validate
], updateCategory);

router.delete('/:id', authorize('administrator'), deleteCategory);

module.exports = router;
