const bcrypt = require('bcryptjs');
const db = require('../config/database');

exports.getUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    let query = 'SELECT id, name, email, role, phone, status, created_at FROM users WHERE 1=1';
    const params = [];
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const [users] = await db.query(query, params);
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, phone, status, created_at FROM users WHERE id = ?', [req.params.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, status } = req.body;
    await db.query('UPDATE users SET name = ?, email = ?, role = ?, phone = ?, status = ? WHERE id = ?',
      [name, email, role, phone, status, req.params.id]);
    const [updated] = await db.query('SELECT id, name, email, role, phone, status FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User updated successfully', data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id == req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};
