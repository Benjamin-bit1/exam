const db = require('../config/database');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = 'SELECT c.*, u.name as created_by_name FROM categories c LEFT JOIN users u ON c.created_by = u.id';
    const params = [];

    if (status) {
      query += ' WHERE c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.name ASC';

    const [categories] = await db.query(query, params);

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};

// Get single category
exports.getCategory = async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT c.*, u.name as created_by_name FROM categories c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = ?',
      [req.params.id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: categories[0]
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category'
    });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    // Check for duplicate
    const [existing] = await db.query('SELECT id FROM categories WHERE name = ?', [name]);
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const [result] = await db.query(
      'INSERT INTO categories (name, description, status, created_by) VALUES (?, ?, ?, ?)',
      [name, description, status || 'active', req.user.id]
    );

    const [newCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory[0]
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category'
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    // Check if category exists
    const [existing] = await db.query('SELECT id FROM categories WHERE id = ?', [req.params.id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check for duplicate name
    const [duplicate] = await db.query(
      'SELECT id FROM categories WHERE name = ? AND id != ?',
      [name, req.params.id]
    );
    
    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    await db.query(
      'UPDATE categories SET name = ?, description = ?, status = ? WHERE id = ?',
      [name, description, status, req.params.id]
    );

    const [updated] = await db.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category'
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    // Check if category has products
    const [products] = await db.query('SELECT id FROM products WHERE category_id = ?', [req.params.id]);
    
    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with associated products'
      });
    }

    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category'
    });
  }
};
