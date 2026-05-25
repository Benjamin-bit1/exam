const db = require('../config/database');

exports.getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date, group_by } = req.query;

    let query = `
      SELECT 
        DATE(sale_date) as date,
        COUNT(*) as total_sales,
        SUM(grand_total) as total_revenue,
        SUM(discount) as total_discount,
        SUM(tax) as total_tax
      FROM sales
      WHERE 1=1
    `;
    const params = [];

    if (start_date && end_date) {
      query += ' AND DATE(sale_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    query += ' GROUP BY DATE(sale_date) ORDER BY date DESC';

    const [report] = await db.query(query, params);

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating sales report' });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const [report] = await db.query(`
      SELECT 
        p.id, p.name, p.sku, p.unit_price, p.quantity_in_stock, p.reorder_level,
        c.name as category_name,
        s.name as supplier_name,
        (p.unit_price * p.quantity_in_stock) as stock_value
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.status = 'active'
      ORDER BY p.name ASC
    `);

    const totalValue = report.reduce((sum, item) => sum + parseFloat(item.stock_value), 0);

    res.json({ success: true, data: { items: report, totalValue } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating inventory report' });
  }
};

exports.getProductPerformance = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        p.id, p.name, p.sku,
        COUNT(si.id) as times_sold,
        SUM(si.quantity) as total_quantity_sold,
        SUM(si.subtotal) as total_revenue
      FROM products p
      LEFT JOIN sale_items si ON p.id = si.product_id
      LEFT JOIN sales s ON si.sale_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (start_date && end_date) {
      query += ' AND DATE(s.sale_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    query += ' GROUP BY p.id ORDER BY total_revenue DESC';

    const [report] = await db.query(query, params);

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating product performance report' });
  }
};
