# 🚀 Quick Start Guide

## Prerequisites Checklist
- [ ] Node.js installed (v14 or higher)
- [ ] MySQL installed and running
- [ ] Git Bash or PowerShell terminal

## Step-by-Step Setup (5 Minutes)

### 1️⃣ Configure Database Password (30 seconds)

Open `backend/.env` and set your MySQL password:

```env
DB_PASSWORD=your_actual_mysql_password
```

**Note:** If your MySQL root user has no password, leave it empty:
```env
DB_PASSWORD=
```

### 2️⃣ Create Database (1 minute)

Open MySQL command line or MySQL Workbench and run:

```bash
mysql -u root -p < setup.sql
```

Or manually in MySQL:
```sql
source C:/Users/dell/Desktop/nn/exam/my-app/exam-main/setup.sql
```

**Verify database creation:**
```sql
SHOW DATABASES;
USE inventory_sales_db;
SHOW TABLES;
```

### 3️⃣ Start Backend Server (1 minute)

```bash
cd backend
npm start
```

**Expected output:**
```
Server running on port 5000
Database connected successfully
```

### 4️⃣ Start Frontend (1 minute)

Open a **NEW terminal** window:

```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

Browser will automatically open at `http://localhost:3000`

### 5️⃣ Login (30 seconds)

Use default admin credentials:
- **Email:** `admin@dabenterprise.com`
- **Password:** `admin123`

## ✅ Success Indicators

You should see:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ Login page loads
- ✅ Dashboard shows statistics after login

## 🐛 Common Issues & Quick Fixes

### Issue: "Database connection failed"
**Fix:**
```bash
# Check if MySQL is running
mysql -u root -p

# Verify password in backend/.env
DB_PASSWORD=your_correct_password
```

### Issue: "react-scripts not found"
**Fix:**
```bash
cd frontend
npm install
```

### Issue: "Port 5000 already in use"
**Fix:** Change port in `backend/.env`:
```env
PORT=5001
```
Then update `frontend/package.json`:
```json
"proxy": "http://localhost:5001"
```

### Issue: "Cannot GET /api/..."
**Fix:** Ensure backend is running first, then restart frontend

### Issue: "Login fails with correct credentials"
**Fix:** Verify database setup completed:
```sql
USE inventory_sales_db;
SELECT * FROM users;
```

## 📊 What's Included

After setup, you'll have:
- ✅ 1 Admin user (admin@dabenterprise.com)
- ✅ 5 Product categories
- ✅ 3 Suppliers
- ✅ 8 Sample products
- ✅ 3 Sample sales transactions

## 🎯 First Steps After Login

1. **Change Admin Password**
   - Click profile icon → Change Password

2. **Explore Dashboard**
   - View statistics
   - Check low stock alerts
   - Review recent sales

3. **Add a Product**
   - Navigate to Products
   - Click "Add Product"
   - Fill in details and save

4. **Make a Sale**
   - Navigate to Sales
   - Click "New Sale"
   - Add products to cart
   - Complete transaction

5. **Generate Reports**
   - Navigate to Reports
   - Select date range
   - View sales/inventory reports

## 🔒 Security Reminders

- [ ] Change default admin password immediately
- [ ] Update JWT_SECRET in production
- [ ] Never commit .env file to Git
- [ ] Use strong passwords for all users

## 📞 Need Help?

Check the detailed README.md for:
- Complete API documentation
- Project structure
- Deployment guide
- Troubleshooting

---

**Ready to manage your inventory! 🎉**
