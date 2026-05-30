const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_sales_db');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_sales_db');
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    await mongoose.connection.close();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

testConnection();
