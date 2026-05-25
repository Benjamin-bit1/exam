const db = require('../config/database');
const { generateInvoiceNumber } = require('../utils/invoiceGenerator');

exports.getSales = async (req, res) => {
  try {
    const { start_date, end_date, payment_status } = req.query;
    let query = `
      SELECT s.*, u.name as sold_by_name, 
      (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as items_count
      FROM sales s
      LEFT JOIN users u ON s.sold_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (start_date && end_date) {
      query += ' AND DATE(s.sale_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    if (payment_status) {
      query += ' AND s.payment_status = ?';
      params.push(payment_status);
    }
    query += ' ORDER BY s.sale_date DESC';

    const [sales] = await db.query(query, params);
    res.json({ success: true, count: sales.length, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching sales' });
  }
};

exports.getSale = async (req, res) => {
  try {
    const [sales] = await db.query(
      `SELECT s.*, u.name as sold_by_name FROM sales s LEFT JOIN users u ON s.sold_by = u.id WHERE s.id = ?`,
      [req.params.id]
    );
    if (sales.length === 0) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    const [items] = await db.query(
      `SELECT si.*, p.name as product_name FROM sale_items si LEFT JOIN products p ON si.product_id = p.id WHERE si.sale_id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...sales[0], items } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching sale' });
  }
};

exports.createSale = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { customer_name, customer_phone, customer_email, items, discount, tax, payment_method, payment_status, notes } = req.body;

    // Calculate totals
    let total_amount = 0;
    for (const item of items) {
      total_amount += item.quantity * item.unit_price;
    }

    const grand_total = total_amount - (discount || 0) + (tax || 0);
    const invoice_number = generateInvoiceNumber();

    // Insert sale
    const [saleResult] = await connection.query(
      `INSERT INTO sales (invoice_number, customer_name, customer_phone, customer_email, total_amount, discount, tax, grand_total, payment_method, payment_status, notes, sold_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoice_number, customer_name, customer_phone, customer_email, total_amount, discount || 0, tax || 0, grand_total, payment_method, payment_status, notes, req.user.id]
    );

    const sale_id = saleResult.insertId;

    // Insert sale items and update stock
    for (const item of items) {
      const subtotal = item.quantity * item.unit_price;
      
      await connection.query(
        'INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [sale_id, item.product_id, item.product_name, item.quantity, item.unit_price, subtotal]
      );

      // Update product stock
      await connection.query(
        'UPDATE products SET quantity_in_stock = quantity_in_stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await connection.commit();

    const [newSale] = await db.query('SELECT * FROM sales WHERE id = ?', [sale_id]);
    res.status(201).json({ success: true, message: 'Sale created successfully', data: newSale[0] });
  } catch (error) {
    await connection.rollback();
    console.error('Create sale error:', error);
    res.status(500).json({ success: false, message: 'Error creating sale' });
  } finally {
    connection.release();
  }
};

exports.deleteSale = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get sale items to restore stock
    const [items] = await connection.query('SELECT product_id, quantity FROM sale_items WHERE sale_id = ?', [req.params.id]);

    // Restore stock
    for (const item of items) {
      await connection.query(
        'UPDATE products SET quantity_in_stock = quantity_in_stock + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Delete sale (cascade will delete items)
    await connection.query('DELETE FROM sales WHERE id = ?', [req.params.id]);

    await connection.commit();
    res.json({ success: true, message: 'Sale deleted successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Error deleting sale' });
  } finally {
    connection.release();
  }
};
