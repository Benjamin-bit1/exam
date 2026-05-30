const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const { status, category_id, low_stock } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category_id) filter.category = category_id;

    let query = Product.find(filter)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .populate('createdBy', 'name')
      .sort({ name: 1 });

    let products = await query;

    if (low_stock === 'true') {
      products = products.filter(p => p.quantityInStock <= p.reorderLevel);
    }

    const productsResponse = products.map(p => ({
      id: p._id,
      name: p.name,
      sku: p.sku,
      category_id: p.category?._id,
      category_name: p.category?.name,
      supplier_id: p.supplier?._id,
      supplier_name: p.supplier?.name,
      description: p.description,
      unit_price: p.unitPrice,
      quantity_in_stock: p.quantityInStock,
      reorder_level: p.reorderLevel,
      image_url: p.imageUrl,
      status: p.status,
      created_by_name: p.createdBy?.name,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    res.json({
      success: true,
      count: productsResponse.length,
      data: productsResponse
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
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        category_id: product.category?._id,
        category_name: product.category?.name,
        supplier_id: product.supplier?._id,
        supplier_name: product.supplier?.name,
        description: product.description,
        unit_price: product.unitPrice,
        quantity_in_stock: product.quantityInStock,
        reorder_level: product.reorderLevel,
        image_url: product.imageUrl,
        status: product.status,
        created_by_name: product.createdBy?.name
      }
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
    const existing = await Product.findOne({ sku });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    const product = await Product.create({
      name,
      sku,
      category: category_id,
      supplier: supplier_id || null,
      description,
      unitPrice: unit_price,
      quantityInStock: quantity_in_stock || 0,
      reorderLevel: reorder_level || 10,
      status: status || 'active',
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        category_id: product.category,
        supplier_id: product.supplier,
        unit_price: product.unitPrice,
        quantity_in_stock: product.quantityInStock,
        reorder_level: product.reorderLevel,
        status: product.status
      }
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
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check for duplicate SKU
    const duplicate = await Product.findOne({
      sku,
      _id: { $ne: req.params.id }
    });
    
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    product.name = name;
    product.sku = sku;
    product.category = category_id;
    product.supplier = supplier_id || null;
    product.description = description;
    product.unitPrice = unit_price;
    product.quantityInStock = quantity_in_stock;
    product.reorderLevel = reorder_level;
    product.status = status;
    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        category_id: product.category,
        supplier_id: product.supplier,
        unit_price: product.unitPrice,
        quantity_in_stock: product.quantityInStock,
        reorder_level: product.reorderLevel,
        status: product.status
      }
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
    const Sale = require('../models/Sale');
    
    // Check if product has sales
    const sales = await Sale.findOne({ 'items.product': req.params.id });
    
    if (sales) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with sales history'
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
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
    const { quantity, operation } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let newQuantity = product.quantityInStock;

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

    product.quantityInStock = newQuantity;
    await product.save();

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        id: product._id,
        name: product.name,
        quantity_in_stock: product.quantityInStock
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock'
    });
  }
};
