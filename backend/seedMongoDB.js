const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_sales_db');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Supplier.deleteMany({});
    await Product.deleteMany({});
    await Sale.deleteMany({});

    console.log('Cleared existing data');

    // Create Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@dabenterprise.com',
      password: hashedPassword,
      role: 'administrator',
      phone: '+1234567890',
      status: 'active'
    });

    console.log('Created admin user');

    // Create Categories
    const categories = await Category.insertMany([
      { name: 'Electronics', description: 'Electronic devices and accessories', status: 'active', createdBy: admin._id },
      { name: 'Furniture', description: 'Office and home furniture', status: 'active', createdBy: admin._id },
      { name: 'Stationery', description: 'Office supplies and stationery items', status: 'active', createdBy: admin._id },
      { name: 'Clothing', description: 'Apparel and fashion items', status: 'active', createdBy: admin._id },
      { name: 'Food & Beverages', description: 'Food products and drinks', status: 'active', createdBy: admin._id }
    ]);

    console.log('Created categories');

    // Create Suppliers
    const suppliers = await Supplier.insertMany([
      {
        name: 'Tech Supplies Inc',
        email: 'contact@techsupplies.com',
        phone: '+1234567891',
        address: '123 Tech Street, Silicon Valley, CA',
        contactPerson: 'John Doe',
        status: 'active',
        createdBy: admin._id
      },
      {
        name: 'Furniture World',
        email: 'info@furnitureworld.com',
        phone: '+1234567892',
        address: '456 Furniture Ave, New York, NY',
        contactPerson: 'Jane Smith',
        status: 'active',
        createdBy: admin._id
      },
      {
        name: 'Office Depot',
        email: 'sales@officedepot.com',
        phone: '+1234567893',
        address: '789 Office Blvd, Chicago, IL',
        contactPerson: 'Bob Johnson',
        status: 'active',
        createdBy: admin._id
      }
    ]);

    console.log('Created suppliers');

    // Create Products
    const products = await Product.insertMany([
      {
        name: 'Laptop Dell XPS 15',
        sku: 'DELL-XPS15-001',
        category: categories[0]._id,
        supplier: suppliers[0]._id,
        description: 'High-performance laptop with 16GB RAM and 512GB SSD',
        unitPrice: 1299.99,
        quantityInStock: 15,
        reorderLevel: 5,
        status: 'active',
        createdBy: admin._id
      },
      {
        name: 'Wireless Mouse Logitech',
        sku: 'LOG-MOUSE-001',
        category: categories[0]._id,
        supplier: suppliers[0]._id,
        description: 'Ergonomic wireless mouse with USB receiver',
        unitPrice: 29.99,
        quantityInStock: 50,
        reorderLevel: 10,
        status: 'active',
        createdBy: admin._id
      },
      {
        name: 'Office Desk Oak',
        sku: 'DESK-OAK-001',
        category: categories[1]._id,
        supplier: suppliers[1]._id,
        description: 'Solid oak office desk 60x30 inches',
        unitPrice: 399.99,
        quantityInStock: 8,
        reorderLevel: 3,
        status: 'active',
        createdBy: admin._id
      },
      {
        name: 'Office Chair Ergonomic',
        sku: 'CHAIR-ERG-001',
        category: categories[1]._id,
        supplier: suppliers[1]._id,
        description: 'Adjustable ergonomic office chair with lumbar support',
        unitPrice: 249.99,
        quantityInStock: 12,
        reorderLevel: 5,
        status: 'active',
        createdBy: admin._id
      },
      {
        name: 'Printer Paper A4 (500 sheets)',
        sku: 'PAPER-A4-500',
        category: categories[2]._id,
        supplier: suppliers[2]._id,
        description: 'Premium white A4 paper, 500 sheets per ream',
        unitPrice: 8.99,
        quantityInStock: 100,
        reorderLevel: 20,
        status: 'active',
        createdBy: admin._id
      },
      {
        name: 'Ballpoint Pens (Pack of 10)',
        sku: 'PEN-BP-10',
        category: categories[2]._id,
        supplier: suppliers[2]._id,
        description: 'Blue ballpoint pens, pack of 10',
        unitPrice: 4.99,
        quantityInStock: 200,
        reorderLevel: 50,
        status: 'active',
        createdBy: admin._id
      },
      {
        name: 'USB Flash Drive 32GB',
        sku: 'USB-32GB-001',
        category: categories[0]._id,
        supplier: suppliers[0]._id,
        description: 'High-speed USB 3.0 flash drive 32GB',
        unitPrice: 12.99,
        quantityInStock: 75,
        reorderLevel: 15,
        status: 'active',
        createdBy: admin._id
      },
      {
        name: 'Notebook A5 Ruled',
        sku: 'NOTE-A5-001',
        category: categories[2]._id,
        supplier: suppliers[2]._id,
        description: 'A5 ruled notebook, 200 pages',
        unitPrice: 3.99,
        quantityInStock: 150,
        reorderLevel: 30,
        status: 'active',
        createdBy: admin._id
      }
    ]);

    console.log('Created products');

    // Create Sample Sales
    const sale1 = await Sale.create({
      invoiceNumber: 'INV-20260524-0001',
      customerName: 'Alice Williams',
      customerPhone: '+1234567894',
      customerEmail: 'alice@email.com',
      items: [
        {
          product: products[0]._id,
          productName: products[0].name,
          quantity: 1,
          unitPrice: products[0].unitPrice,
          subtotal: products[0].unitPrice
        },
        {
          product: products[1]._id,
          productName: products[1].name,
          quantity: 1,
          unitPrice: products[1].unitPrice,
          subtotal: products[1].unitPrice
        }
      ],
      totalAmount: products[0].unitPrice + products[1].unitPrice,
      discount: 30,
      tax: 104,
      grandTotal: products[0].unitPrice + products[1].unitPrice - 30 + 104,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      notes: 'Corporate purchase',
      soldBy: admin._id,
      saleDate: new Date('2026-05-24T10:30:00')
    });

    const sale2 = await Sale.create({
      invoiceNumber: 'INV-20260524-0002',
      customerName: 'Bob Martinez',
      customerPhone: '+1234567895',
      customerEmail: 'bob@email.com',
      items: [
        {
          product: products[2]._id,
          productName: products[2].name,
          quantity: 1,
          unitPrice: products[2].unitPrice,
          subtotal: products[2].unitPrice
        },
        {
          product: products[3]._id,
          productName: products[3].name,
          quantity: 1,
          unitPrice: products[3].unitPrice,
          subtotal: products[3].unitPrice
        }
      ],
      totalAmount: products[2].unitPrice + products[3].unitPrice,
      discount: 0,
      tax: 52,
      grandTotal: products[2].unitPrice + products[3].unitPrice + 52,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      soldBy: admin._id,
      saleDate: new Date('2026-05-24T14:15:00')
    });

    const sale3 = await Sale.create({
      invoiceNumber: 'INV-20260523-0001',
      customerName: 'Carol Davis',
      customerPhone: '+1234567896',
      items: [
        {
          product: products[4]._id,
          productName: products[4].name,
          quantity: 5,
          unitPrice: products[4].unitPrice,
          subtotal: products[4].unitPrice * 5
        },
        {
          product: products[5]._id,
          productName: products[5].name,
          quantity: 2,
          unitPrice: products[5].unitPrice,
          subtotal: products[5].unitPrice * 2
        },
        {
          product: products[7]._id,
          productName: products[7].name,
          quantity: 1,
          unitPrice: products[7].unitPrice,
          subtotal: products[7].unitPrice
        }
      ],
      totalAmount: (products[4].unitPrice * 5) + (products[5].unitPrice * 2) + products[7].unitPrice,
      discount: 5,
      tax: 4.31,
      grandTotal: (products[4].unitPrice * 5) + (products[5].unitPrice * 2) + products[7].unitPrice - 5 + 4.31,
      paymentMethod: 'mobile_money',
      paymentStatus: 'paid',
      soldBy: admin._id,
      saleDate: new Date('2026-05-23T09:45:00')
    });

    // Update product stock after sales
    await Product.findByIdAndUpdate(products[0]._id, { $inc: { quantityInStock: -1 } });
    await Product.findByIdAndUpdate(products[1]._id, { $inc: { quantityInStock: -1 } });
    await Product.findByIdAndUpdate(products[2]._id, { $inc: { quantityInStock: -1 } });
    await Product.findByIdAndUpdate(products[3]._id, { $inc: { quantityInStock: -1 } });
    await Product.findByIdAndUpdate(products[4]._id, { $inc: { quantityInStock: -5 } });
    await Product.findByIdAndUpdate(products[5]._id, { $inc: { quantityInStock: -2 } });
    await Product.findByIdAndUpdate(products[7]._id, { $inc: { quantityInStock: -1 } });

    console.log('Created sample sales and updated stock');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: 1 (Admin)`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Suppliers: ${suppliers.length}`);
    console.log(`- Products: ${products.length}`);
    console.log(`- Sales: 3`);
    console.log('\n🔐 Admin Login:');
    console.log('Email: admin@dabenterprise.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
connectDB().then(() => {
  seedData();
});
