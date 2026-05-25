# Quick Setup Guide - Inventory & Sales Management System

## 🚀 Quick Start (5 Minutes)

### Step 1: Database Setup (2 minutes)

1. Open MySQL command line or MySQL Workbench
2. Run the setup script:
   ```bash
   mysql -u root -p < setup.sql
   ```
   Or copy and paste the contents of `setup.sql` into MySQL Workbench and execute.

3. Verify database creation:
   ```sql
   USE inventory_sales_db;
   SHOW TABLES;
   ```

### Step 2: Backend Setup (1 minute)

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update `.env` file with your MySQL password:
   ```env
   DB_PASSWORD=your_mysql_password
   ```

4. Start the server:
   ```bash
   npm start
   ```
   
   You should see: `Server running on port 5000` and `Database connected successfully`

### Step 3: Frontend Setup (1 minute)

1. Open a new terminal and navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   
   The browser will automatically open at `http://localhost:3000`

### Step 4: Login (30 seconds)

Use the default admin credentials:
- **Email:** `admin@dabenterprise.com`
- **Password:** `admin123`

## ✅ Verification Checklist

- [ ] MySQL is running
- [ ] Database `inventory_sales_db` exists
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can login with admin credentials
- [ ] Dashboard displays statistics

## 🔧 Common Issues & Solutions

### Issue: "Database connection failed"
**Solution:** 
- Check if MySQL is running
- Verify DB_PASSWORD in backend/.env
- Ensure database exists: `CREATE DATABASE inventory_sales_db;`

### Issue: "Port 5000 already in use"
**Solution:** 
- Change PORT in backend/.env to 5001
- Update proxy in frontend/package.json to "http://localhost:5001"

### Issue: "Cannot connect to backend"
**Solution:**
- Ensure backend server is running
- Check console for errors
- Verify proxy setting in frontend/package.json

### Issue: "Login fails"
**Solution:**
- Verify database has the admin user (check setup.sql was run)
- Check browser console for errors
- Ensure backend is running and accessible

## 📊 Sample Data Included

The setup script includes:
- 1 Admin user
- 5 Categories (Electronics, Furniture, Stationery, Clothing, Food & Beverages)
- 3 Suppliers
- 8 Sample products
- 3 Sample sales transactions

## 🎯 Next Steps

1. **Change Admin Password**
   - Login → Profile → Change Password

2. **Add Your Products**
   - Navigate to Products → Add Product

3. **Create Users**
   - Navigate to Users → Add User (Admin only)

4. **Make a Sale**
   - Navigate to Sales → New Sale
   - Add products to cart
   - Complete transaction

5. **View Reports**
   - Navigate to Reports
   - Select date range
   - Generate reports

## 📱 Features to Explore

- **Dashboard:** Real-time statistics and alerts
- **Products:** Full inventory management
- **Sales:** POS interface with cart
- **Categories:** Organize products
- **Suppliers:** Manage supplier information
- **Users:** User management (Admin only)
- **Reports:** Sales and inventory analytics

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints in README.md
- Check browser console for frontend errors
- Check terminal for backend errors

## 🔐 Security Notes

- Change the default admin password immediately
- Update JWT_SECRET in production
- Never commit .env file to version control
- Use strong passwords for all users

---

**Ready to go! Start managing your inventory and sales efficiently! 🎉**
