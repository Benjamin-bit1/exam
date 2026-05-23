const db = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    // Total products
    const [productCount] = await db.query('SELECT COUNT(*) as count FROM products WHERE status = "active"');
    
    // Low stock products
    const [lowStockCount] = await db.query('SELECT COUNT(*) as count FROM products WHERE quantity_in_stock <= reorder_level AND status = "active"');
    
    // Total sales today
    const [todaySales] = await db.query('SELECT COUNT(*) as count, COALESCE(SUM(grand_total), 0) as total FROM sales WHERE DATE(sale_date) = CURDATE()');
    
    // Total sales this month
    const [monthSales] = await db.query('SELECT COUNT(*) as count, COALESCE(SUM(grand_total), 0) as total FROM sales WHERE MONTH(sale_date) = MONTH(CURDATE()) AND YEAR(sale_date) = YEAR(CURDATE())');
    
    // Recent sales
    const [recentSales] = await db.query(`
      SELECT s.*, u.name as sold_by_name 
      FROM sales s 
      LEFT JOIN users u ON s.sold_by = u.id 
      ORDER BY s.sale_date DESC 
      LIMIT 10
    `);
    
    // Low stock products
    const [lowStockProducts] = await db.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.quantity_in_stock <= p.reorder_level AND p.status = 'active' 
      ORDER BY p.quantity_in_stock ASC 
      LIMIT 10
    `);
    
    // Top selling products
    const [topProducts] = await db.query(`
      SELECT p.name, p.sku, SUM(si.quantity) as total_sold, SUM(si.subtotal) as total_revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      GROUP BY si.product_id
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        totalProducts: productCount[0].count,
        lowStockCount: lowStockCount[0].count,
        todaySales: {
          count: todaySales[0].count,
          total: parseFloat(todaySales[0].total)
        },
        monthSales: {
          count: monthSales[0].count,
          total: parseFloat(monthSales[0].total)
        },
        recentSales,
        lowStockProducts,
        topProducts
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats' });
  }
};
