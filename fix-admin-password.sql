-- ============================================
-- Fix Admin Password
-- ============================================
-- This script updates the admin user password to 'admin123'
-- Run this if you're having login issues

USE inventory_sales_db;

-- Update admin password (password: admin123)
UPDATE users 
SET password = '$2a$10$egNE0gy./OkIO8ZuXMp.FuFRxfWf9UIa6nVdvY2du5nsU.8VuczW.'
WHERE email = 'admin@dabenterprise.com';

-- Verify the update
SELECT id, name, email, role, status 
FROM users 
WHERE email = 'admin@dabenterprise.com';

SELECT 'Admin password updated successfully! You can now login with:' AS Message;
SELECT 'Email: admin@dabenterprise.com' AS Info;
SELECT 'Password: admin123' AS Info;
