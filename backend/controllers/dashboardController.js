const Product = require('../models/Product');
const Sale = require('../models/Sale');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Total products
    const totalProducts = await Product.countDocuments({ status: 'active' });
    
    // Low stock products
    const allProducts = await Product.find({ status: 'active' });
    const lowStockCount = allProducts.filter(p => p.quantityInStock <= p.reorderLevel).length;
    
    // Today's sales
    const todaySalesData = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$grandTotal' }
        }
      }
    ]);

    const todaySales = todaySalesData.length > 0 
      ? { count: todaySalesData[0].count, total: todaySalesData[0].total }
      : { count: 0, total: 0 };
    
    // Month sales
    const monthSalesData = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$grandTotal' }
        }
      }
    ]);

    const monthSales = monthSalesData.length > 0
      ? { count: monthSalesData[0].count, total: monthSalesData[0].total }
      : { count: 0, total: 0 };
    
    // Recent sales
    const recentSales = await Sale.find()
      .populate('soldBy', 'name')
      .sort({ saleDate: -1 })
      .limit(10);

    const recentSalesResponse = recentSales.map(sale => ({
      id: sale._id,
      invoice_number: sale.invoiceNumber,
      customer_name: sale.customerName,
      grand_total: sale.grandTotal,
      payment_status: sale.paymentStatus,
      sale_date: sale.saleDate,
      sold_by_name: sale.soldBy?.name
    }));
    
    // Low stock products
    const lowStockProducts = allProducts
      .filter(p => p.quantityInStock <= p.reorderLevel)
      .sort((a, b) => a.quantityInStock - b.quantityInStock)
      .slice(0, 10);

    const lowStockProductsResponse = await Promise.all(
      lowStockProducts.map(async (p) => {
        await p.populate('category', 'name');
        return {
          id: p._id,
          name: p.name,
          sku: p.sku,
          quantity_in_stock: p.quantityInStock,
          reorder_level: p.reorderLevel,
          category_name: p.category?.name
        };
      })
    );
    
    // Top selling products
    const topProductsData = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          total_sold: { $sum: '$items.quantity' },
          total_revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { total_sold: -1 } },
      { $limit: 10 }
    ]);

    const topProducts = await Promise.all(
      topProductsData.map(async (item) => {
        const product = await Product.findById(item._id).select('sku');
        return {
          name: item.productName,
          sku: product?.sku || 'N/A',
          total_sold: item.total_sold,
          total_revenue: item.total_revenue
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalProducts,
        lowStockCount,
        todaySales,
        monthSales,
        recentSales: recentSalesResponse,
        lowStockProducts: lowStockProductsResponse,
        topProducts
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats' });
  }
};
