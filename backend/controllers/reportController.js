const Sale = require('../models/Sale');
const Product = require('../models/Product');

exports.getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const matchFilter = {};
    if (start_date && end_date) {
      matchFilter.saleDate = {
        $gte: new Date(start_date),
        $lte: new Date(end_date + 'T23:59:59.999Z')
      };
    }

    const report = await Sale.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
          total_sales: { $sum: 1 },
          total_revenue: { $sum: '$grandTotal' },
          total_discount: { $sum: '$discount' },
          total_tax: { $sum: '$tax' }
        }
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          date: '$_id',
          total_sales: 1,
          total_revenue: 1,
          total_discount: 1,
          total_tax: 1,
          _id: 0
        }
      }
    ]);

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ success: false, message: 'Error generating sales report' });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' })
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ name: 1 });

    const items = products.map(p => ({
      id: p._id,
      name: p.name,
      sku: p.sku,
      unit_price: p.unitPrice,
      quantity_in_stock: p.quantityInStock,
      reorder_level: p.reorderLevel,
      category_name: p.category?.name,
      supplier_name: p.supplier?.name,
      stock_value: p.unitPrice * p.quantityInStock
    }));

    const totalValue = items.reduce((sum, item) => sum + item.stock_value, 0);

    res.json({ success: true, data: { items, totalValue } });
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({ success: false, message: 'Error generating inventory report' });
  }
};

exports.getProductPerformance = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const matchFilter = {};
    if (start_date && end_date) {
      matchFilter.saleDate = {
        $gte: new Date(start_date),
        $lte: new Date(end_date + 'T23:59:59.999Z')
      };
    }

    const performance = await Sale.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          times_sold: { $sum: 1 },
          total_quantity_sold: { $sum: '$items.quantity' },
          total_revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { total_revenue: -1 } }
    ]);

    const report = await Promise.all(
      performance.map(async (item) => {
        const product = await Product.findById(item._id).select('sku');
        return {
          id: item._id,
          name: item.productName,
          sku: product?.sku || 'N/A',
          times_sold: item.times_sold,
          total_quantity_sold: item.total_quantity_sold,
          total_revenue: item.total_revenue
        };
      })
    );

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Product performance error:', error);
    res.status(500).json({ success: false, message: 'Error generating product performance report' });
  }
};
