const express = require('express');
const { body } = require('express-validator');
const { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

router.use(protect);

router.get('/', getSuppliers);
router.get('/:id', getSupplier);

router.post('/', authorize('administrator'), [
  body('name').notEmpty().withMessage('Supplier name is required'),
  validate
], createSupplier);

router.put('/:id', authorize('administrator'), [
  body('name').notEmpty().withMessage('Supplier name is required'),
  validate
], updateSupplier);

router.delete('/:id', authorize('administrator'), deleteSupplier);

module.exports = router;
