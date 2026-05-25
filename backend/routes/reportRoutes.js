const express = require('express');
const { getSalesReport, getInventoryReport, getProductPerformance } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);
router.get('/product-performance', getProductPerformance);

module.exports = router;
