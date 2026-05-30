const Category = require('../models/Category');
const Product = require('../models/Product');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const categories = await Category.find(filter)
      .populate('createdBy', 'name')
      .sort({ name: 1 });

    const categoriesResponse = categories.map(cat => ({
      id: cat._id,
      name: cat.name,
      description: cat.description,
      status: cat.status,
      created_by_name: cat.createdBy?.name,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    }));

    res.json({
      success: true,
      count: categoriesResponse.length,
      data: categoriesResponse
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
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: category._id,
        name: category.name,
        description: category.description,
        status: category.status,
        created_by_name: category.createdBy?.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
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
    const existing = await Category.findOne({ name });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await Category.create({
      name,
      description,
      status: status || 'active',
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        id: category._id,
        name: category.name,
        description: category.description,
        status: category.status
      }
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
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check for duplicate name
    const duplicate = await Category.findOne({ 
      name, 
      _id: { $ne: req.params.id } 
    });
    
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    category.name = name;
    category.description = description;
    category.status = status;
    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        id: category._id,
        name: category.name,
        description: category.description,
        status: category.status
      }
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
    const products = await Product.findOne({ category: req.params.id });
    
    if (products) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with associated products'
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
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
