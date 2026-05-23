const express = require('express');
const { body } = require('express-validator');
const { getSales, getSale, createSale, deleteSale } = require('../controllers/salesController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

router.use(protect);

router.get('/', getSales);
router.get('/:id', getSale);

router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('payment_method').isIn(['cash', 'card', 'mobile_money', 'bank_transfer']).withMessage('Valid payment method is required'),
  validate
], createSale);

router.delete('/:id', authorize('administrator'), deleteSale);

module.exports = router;
