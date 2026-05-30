# 🔧 Login Error Fix Guide

## Problem
Unable to login with default admin credentials (`admin@dabenterprise.com` / `admin123`)

## Root Cause
The password hash in the database was incorrect (placeholder value instead of actual bcrypt hash).

## ✅ Solution - Choose One Method

### Method 1: Update Existing Database (Quick Fix)

Run this SQL script to fix the admin password:

```bash
mysql -u root -p < fix-admin-password.sql
```

Or manually in MySQL:

```sql
USE inventory_sales_db;

UPDATE users 
SET password = '$2a$10$egNE0gy./OkIO8ZuXMp.FuFRxfWf9UIa6nVdvY2du5nsU.8VuczW.'
WHERE email = 'admin@dabenterprise.com';
```

### Method 2: Recreate Database (Clean Start)

If you want to start fresh with all sample data:

```bash
# Drop and recreate the database
mysql -u root -p

# In MySQL prompt:
DROP DATABASE IF EXISTS inventory_sales_db;
exit

# Run the updated setup script
mysql -u root -p < setup.sql
```

## 🧪 Verify the Fix

### 1. Check Database
```sql
USE inventory_sales_db;
SELECT email, role, status FROM users WHERE email = 'admin@dabenterprise.com';
```

You should see:
- Email: `admin@dabenterprise.com`
- Role: `administrator`
- Status: `active`

### 2. Test Backend
Make sure backend is running:
```bash
cd backend
npm start
```

You should see:
```
Server running on port 5000
Database connected successfully
Environment variables loaded:
- JWT_SECRET: ✓ Loaded
```

### 3. Test Login
Open browser at `http://localhost:3000` and login with:
- **Email**: `admin@dabenterprise.com`
- **Password**: `admin123`

## 🐛 Still Having Issues?

### Issue: "Invalid email or password"

**Check 1: Verify .env file**
```bash
cd backend
cat .env
```

Ensure `JWT_SECRET` is set:
```env
JWT_SECRET=dab_enterprise_inventory_sales_jwt_secret_key_2026_change_in_production
```

**Check 2: Restart backend server**
```bash
# Stop the server (Ctrl+C)
# Start again
npm start
```

**Check 3: Check browser console**
- Open DevTools (F12)
- Go to Console tab
- Look for error messages

**Check 4: Check backend logs**
Look at the terminal where backend is running for error messages.

### Issue: "Database connection failed"

**Fix:**
1. Ensure MySQL is running
2. Check `DB_PASSWORD` in `backend/.env`
3. Verify database exists:
   ```sql
   SHOW DATABASES LIKE 'inventory_sales_db';
   ```

### Issue: "secretOrPrivateKey must have a value"

**Fix:**
1. Check `backend/.env` has `JWT_SECRET` set
2. Restart backend server
3. Run verification:
   ```bash
   cd backend
   npm run verify-env
   ```

### Issue: "Cannot connect to backend"

**Fix:**
1. Ensure backend is running on port 5000
2. Check `frontend/package.json` has proxy:
   ```json
   "proxy": "http://localhost:5000"
   ```
3. Restart frontend:
   ```bash
   cd frontend
   npm start
   ```

## 📝 Test Credentials

After fixing, you can login with:

### Admin Account
- **Email**: `admin@dabenterprise.com`
- **Password**: `admin123`
- **Role**: Administrator (full access)

### Create New Users
After logging in as admin:
1. Navigate to **Users** page
2. Click **Add User**
3. Fill in details and assign role
4. New user can login with their credentials

## 🔐 Security Note

**IMPORTANT**: Change the default admin password immediately after first login!

1. Login as admin
2. Click on user dropdown (top-right)
3. Select **Profile**
4. Change password to something secure

## 🛠️ Generate New Password Hash

If you need to create a new password hash:

```bash
cd backend
node generate-password.js
```

This will generate a bcrypt hash for "admin123" that you can use in SQL.

## 📊 Database Schema Check

Verify users table structure:

```sql
USE inventory_sales_db;
DESCRIBE users;
```

Should show:
- `id` (INT, PRIMARY KEY)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR)
- `role` (ENUM: administrator, sales_officer)
- `status` (ENUM: active, inactive)

## 🔄 Complete Reset (Last Resort)

If nothing works, do a complete reset:

```bash
# 1. Stop backend and frontend servers

# 2. Drop database
mysql -u root -p
DROP DATABASE IF EXISTS inventory_sales_db;
exit

# 3. Recreate database
mysql -u root -p < setup.sql

# 4. Verify .env file
cd backend
cat .env
# Ensure JWT_SECRET and DB_PASSWORD are set

# 5. Restart backend
npm start

# 6. Restart frontend (new terminal)
cd ../frontend
npm start

# 7. Try login again
```

## ✅ Success Indicators

After successful fix, you should see:

1. **Backend Console**:
   ```
   Server running on port 5000
   Database connected successfully
   JWT_SECRET: ✓ Loaded
   ```

2. **Login Page**: Loads without errors

3. **After Login**: Redirects to Dashboard with statistics

4. **Dashboard**: Shows:
   - Total Products
   - Low Stock Items
   - Today's Sales
   - Today's Revenue

## 📞 Need More Help?

Check these files for more information:
- `README.md` - Complete documentation
- `QUICK_START.md` - Setup guide
- `SETUP_GUIDE.md` - Detailed setup instructions

---

**Last Updated**: May 25, 2026
