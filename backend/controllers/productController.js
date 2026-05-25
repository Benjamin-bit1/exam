const db = require('../config/database');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const { status, category_id, low_stock } = req.query;
    
    let query = `
      SELECT p.*, c.name as category_name, s.name as supplier_name, u.name as created_by_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (category_id) {
      query += ' AND p.category_id = ?';
      params.push(category_id);
    }

    if (low_stock === 'true') {
      query += ' AND p.quantity_in_stock <= p.reorder_level';
    }

    query += ' ORDER BY p.name ASC';

    const [products] = await db.query(query, params);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, c.name as category_name, s.name as supplier_name, u.name as created_by_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, sku, category_id, supplier_id, description, unit_price, quantity_in_stock, reorder_level, status } = req.body;

    // Check for duplicate SKU
    const [existing] = await db.query('SELECT id FROM products WHERE sku = ?', [sku]);
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    const [result] = await db.query(
      `INSERT INTO products (name, sku, category_id, supplier_id, description, unit_price, quantity_in_stock, reorder_level, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, sku, category_id, supplier_id || null, description, unit_price, quantity_in_stock || 0, reorder_level || 10, status || 'active', req.user.id]
    );

    const [newProduct] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product'
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, sku, category_id, supplier_id, description, unit_price, quantity_in_stock, reorder_level, status } = req.body;

    // Check if product exists
    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [req.params.id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check for duplicate SKU
    const [duplicate] = await db.query(
      'SELECT id FROM products WHERE sku = ? AND id != ?',
      [sku, req.params.id]
    );
    
    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    await db.query(
      `UPDATE products SET name = ?, sku = ?, category_id = ?, supplier_id = ?, description = ?, 
       unit_price = ?, quantity_in_stock = ?, reorder_level = ?, status = ? WHERE id = ?`,
      [name, sku, category_id, supplier_id || null, description, unit_price, quantity_in_stock, reorder_level, status, req.params.id]
    );

    const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    // Check if product has sales
    const [sales] = await db.query('SELECT id FROM sale_items WHERE product_id = ?', [req.params.id]);
    
    if (sales.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with sales history'
      });
    }

    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
};

// Update stock
exports.updateStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'

    const [products] = await db.query('SELECT quantity_in_stock FROM products WHERE id = ?', [req.params.id]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let newQuantity = products[0].quantity_in_stock;

    if (operation === 'add') {
      newQuantity += parseInt(quantity);
    } else if (operation === 'subtract') {
      newQuantity -= parseInt(quantity);
      if (newQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }
    }

    await db.query('UPDATE products SET quantity_in_stock = ? WHERE id = ?', [newQuantity, req.params.id]);

    const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock'
    });
  }
};
