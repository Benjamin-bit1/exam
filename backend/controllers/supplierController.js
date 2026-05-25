const db = require('../config/database');

exports.getSuppliers = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT s.*, u.name as created_by_name FROM suppliers s LEFT JOIN users u ON s.created_by = u.id';
    const params = [];
    if (status) {
      query += ' WHERE s.status = ?';
      params.push(status);
    }
    query += ' ORDER BY s.name ASC';
    const [suppliers] = await db.query(query, params);
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching suppliers' });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const [suppliers] = await db.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ success: true, data: suppliers[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching supplier' });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, contact_person, status } = req.body;
    const [result] = await db.query(
      'INSERT INTO suppliers (name, email, phone, address, contact_person, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, address, contact_person, status || 'active', req.user.id]
    );
    const [newSupplier] = await db.query('SELECT * FROM suppliers WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Supplier created successfully', data: newSupplier[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating supplier' });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, contact_person, status } = req.body;
    await db.query(
      'UPDATE suppliers SET name = ?, email = ?, phone = ?, address = ?, contact_person = ?, status = ? WHERE id = ?',
      [name, email, phone, address, contact_person, status, req.params.id]
    );
    const [updated] = await db.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Supplier updated successfully', data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating supplier' });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting supplier' });
  }
};
