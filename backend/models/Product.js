const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  description: {
    type: String,
    trim: true
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: 0
  },
  quantityInStock: {
    type: Number,
    default: 0,
    min: 0
  },
  reorderLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  imageUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for checking if product is low stock
productSchema.virtual('isLowStock').get(function() {
  return this.quantityInStock <= this.reorderLevel;
});

module.exports = mongoose.model('Product', productSchema);
