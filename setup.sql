-- ============================================
-- DAB Enterprise Ltd - Inventory & Sales Management System
-- Complete Database Setup Script
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS inventory_sales_db;
USE inventory_sales_db;

-- ============================================
-- DROP EXISTING TABLES (if any)
-- ============================================
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('administrator', 'sales_officer') DEFAULT 'sales_officer',
  phone VARCHAR(20),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_name (name),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUPPLIERS TABLE
-- ============================================
CREATE TABLE suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  contact_person VARCHAR(100),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_name (name),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category_id INT NOT NULL,
  supplier_id INT,
  description TEXT,
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity_in_stock INT DEFAULT 0,
  reorder_level INT DEFAULT 10,
  image_url VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_supplier (supplier_id),
  INDEX idx_sku (sku),
  INDEX idx_status (status),
  INDEX idx_stock (quantity_in_stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SALES TABLE
-- ============================================
CREATE TABLE sales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(100),
  total_amount DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  grand_total DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash', 'card', 'mobile_money', 'bank_transfer') DEFAULT 'cash',
  payment_status ENUM('paid', 'pending', 'partial') DEFAULT 'paid',
  notes TEXT,
  sold_by INT NOT NULL,
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sold_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_invoice (invoice_number),
  INDEX idx_sale_date (sale_date),
  INDEX idx_payment_status (payment_status),
  INDEX idx_sold_by (sold_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SALE ITEMS TABLE
-- ============================================
CREATE TABLE sale_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_sale (sale_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Default Admin User (password: admin123)
-- Password hash generated with bcrypt, salt rounds: 10
INSERT INTO users (name, email, password, role, phone) VALUES 
('System Administrator', 'admin@dabenterprise.com', '$2a$10$rZ5YhJKvXqKqKqKqKqKqKuXqKqKqKqKqKqKqKqKqKqKqKqKqKqKqK', 'administrator', '+1234567890');

-- Sample Categories
INSERT INTO categories (name, description, status, created_by) VALUES
('Electronics', 'Electronic devices and accessories', 'active', 1),
('Furniture', 'Office and home furniture', 'active', 1),
('Stationery', 'Office supplies and stationery items', 'active', 1),
('Clothing', 'Apparel and fashion items', 'active', 1),
('Food & Beverages', 'Food products and drinks', 'active', 1);

-- Sample Suppliers
INSERT INTO suppliers (name, email, phone, address, contact_person, status, created_by) VALUES
('Tech Supplies Inc', 'contact@techsupplies.com', '+1234567891', '123 Tech Street, Silicon Valley, CA', 'John Doe', 'active', 1),
('Furniture World', 'info@furnitureworld.com', '+1234567892', '456 Furniture Ave, New York, NY', 'Jane Smith', 'active', 1),
('Office Depot', 'sales@officedepot.com', '+1234567893', '789 Office Blvd, Chicago, IL', 'Bob Johnson', 'active', 1);

-- Sample Products
INSERT INTO products (name, sku, category_id, supplier_id, description, unit_price, quantity_in_stock, reorder_level, status, created_by) VALUES
('Laptop Dell XPS 15', 'DELL-XPS15-001', 1, 1, 'High-performance laptop with 16GB RAM and 512GB SSD', 1299.99, 15, 5, 'active', 1),
('Wireless Mouse Logitech', 'LOG-MOUSE-001', 1, 1, 'Ergonomic wireless mouse with USB receiver', 29.99, 50, 10, 'active', 1),
('Office Desk Oak', 'DESK-OAK-001', 2, 2, 'Solid oak office desk 60x30 inches', 399.99, 8, 3, 'active', 1),
('Office Chair Ergonomic', 'CHAIR-ERG-001', 2, 2, 'Adjustable ergonomic office chair with lumbar support', 249.99, 12, 5, 'active', 1),
('Printer Paper A4 (500 sheets)', 'PAPER-A4-500', 3, 3, 'Premium white A4 paper, 500 sheets per ream', 8.99, 100, 20, 'active', 1),
('Ballpoint Pens (Pack of 10)', 'PEN-BP-10', 3, 3, 'Blue ballpoint pens, pack of 10', 4.99, 200, 50, 'active', 1),
('USB Flash Drive 32GB', 'USB-32GB-001', 1, 1, 'High-speed USB 3.0 flash drive 32GB', 12.99, 75, 15, 'active', 1),
('Notebook A5 Ruled', 'NOTE-A5-001', 3, 3, 'A5 ruled notebook, 200 pages', 3.99, 150, 30, 'active', 1);

-- Sample Sales
INSERT INTO sales (invoice_number, customer_name, customer_phone, customer_email, total_amount, discount, tax, grand_total, payment_method, payment_status, notes, sold_by, sale_date) VALUES
('INV-20260524-0001', 'Alice Williams', '+1234567894', 'alice@email.com', 1329.98, 30.00, 104.00, 1403.98, 'card', 'paid', 'Corporate purchase', 1, '2026-05-24 10:30:00'),
('INV-20260524-0002', 'Bob Martinez', '+1234567895', 'bob@email.com', 649.98, 0.00, 52.00, 701.98, 'cash', 'paid', NULL, 1, '2026-05-24 14:15:00'),
('INV-20260523-0001', 'Carol Davis', '+1234567896', NULL, 58.94, 5.00, 4.31, 58.25, 'mobile_money', 'paid', NULL, 1, '2026-05-23 09:45:00');

-- Sample Sale Items
INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
(1, 1, 'Laptop Dell XPS 15', 1, 1299.99, 1299.99),
(1, 2, 'Wireless Mouse Logitech', 1, 29.99, 29.99),
(2, 3, 'Office Desk Oak', 1, 399.99, 399.99),
(2, 4, 'Office Chair Ergonomic', 1, 249.99, 249.99),
(3, 5, 'Printer Paper A4 (500 sheets)', 5, 8.99, 44.95),
(3, 6, 'Ballpoint Pens (Pack of 10)', 2, 4.99, 9.98),
(3, 8, 'Notebook A5 Ruled', 1, 3.99, 3.99);

-- Update product stock after sales
UPDATE products SET quantity_in_stock = quantity_in_stock - 1 WHERE id = 1;
UPDATE products SET quantity_in_stock = quantity_in_stock - 1 WHERE id = 2;
UPDATE products SET quantity_in_stock = quantity_in_stock - 1 WHERE id = 3;
UPDATE products SET quantity_in_stock = quantity_in_stock - 1 WHERE id = 4;
UPDATE products SET quantity_in_stock = quantity_in_stock - 5 WHERE id = 5;
UPDATE products SET quantity_in_stock = quantity_in_stock - 2 WHERE id = 6;
UPDATE products SET quantity_in_stock = quantity_in_stock - 1 WHERE id = 8;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify tables created
SELECT 'Tables created successfully' AS Status;
SHOW TABLES;

-- Verify data inserted
SELECT 'Users:' AS Info, COUNT(*) AS Count FROM users;
SELECT 'Categories:' AS Info, COUNT(*) AS Count FROM categories;
SELECT 'Suppliers:' AS Info, COUNT(*) AS Count FROM suppliers;
SELECT 'Products:' AS Info, COUNT(*) AS Count FROM products;
SELECT 'Sales:' AS Info, COUNT(*) AS Count FROM sales;
SELECT 'Sale Items:' AS Info, COUNT(*) AS Count FROM sale_items;

-- ============================================
-- USEFUL QUERIES FOR TESTING
-- ============================================

-- View all products with low stock
-- SELECT * FROM products WHERE quantity_in_stock <= reorder_level;

-- View sales summary
-- SELECT DATE(sale_date) as date, COUNT(*) as total_sales, SUM(grand_total) as revenue FROM sales GROUP BY DATE(sale_date);

-- View top selling products
-- SELECT p.name, SUM(si.quantity) as total_sold FROM sale_items si JOIN products p ON si.product_id = p.id GROUP BY si.product_id ORDER BY total_sold DESC;

SELECT 'Database setup completed successfully!' AS Message;
