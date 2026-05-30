const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    const usersResponse = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    }));

    res.json({ success: true, count: usersResponse.length, data: usersResponse });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ 
      success: true, 
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        created_at: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Error fetching user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, phone, status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'User updated successfully', 
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};
