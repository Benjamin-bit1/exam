import axios from 'axios';

const API_URL = '/api';

// Auth
export const login = (credentials) => axios.post(`${API_URL}/auth/login`, credentials);
export const register = (userData) => axios.post(`${API_URL}/auth/register`, userData);
export const getMe = () => axios.get(`${API_URL}/auth/me`);
export const changePassword = (data) => axios.put(`${API_URL}/auth/change-password`, data);

// Categories
export const getCategories = (params) => axios.get(`${API_URL}/categories`, { params });
export const getCategory = (id) => axios.get(`${API_URL}/categories/${id}`);
export const createCategory = (data) => axios.post(`${API_URL}/categories`, data);
export const updateCategory = (id, data) => axios.put(`${API_URL}/categories/${id}`, data);
export const deleteCategory = (id) => axios.delete(`${API_URL}/categories/${id}`);

// Suppliers
export const getSuppliers = (params) => axios.get(`${API_URL}/suppliers`, { params });
export const getSupplier = (id) => axios.get(`${API_URL}/suppliers/${id}`);
export const createSupplier = (data) => axios.post(`${API_URL}/suppliers`, data);
export const updateSupplier = (id, data) => axios.put(`${API_URL}/suppliers/${id}`, data);
export const deleteSupplier = (id) => axios.delete(`${API_URL}/suppliers/${id}`);

// Products
export const getProducts = (params) => axios.get(`${API_URL}/products`, { params });
export const getProduct = (id) => axios.get(`${API_URL}/products/${id}`);
export const createProduct = (data) => axios.post(`${API_URL}/products`, data);
export const updateProduct = (id, data) => axios.put(`${API_URL}/products/${id}`, data);
export const deleteProduct = (id) => axios.delete(`${API_URL}/products/${id}`);
export const updateStock = (id, data) => axios.patch(`${API_URL}/products/${id}/stock`, data);

// Sales
export const getSales = (params) => axios.get(`${API_URL}/sales`, { params });
export const getSale = (id) => axios.get(`${API_URL}/sales/${id}`);
export const createSale = (data) => axios.post(`${API_URL}/sales`, data);
export const deleteSale = (id) => axios.delete(`${API_URL}/sales/${id}`);

// Users
export const getUsers = (params) => axios.get(`${API_URL}/users`, { params });
export const getUser = (id) => axios.get(`${API_URL}/users/${id}`);
export const updateUser = (id, data) => axios.put(`${API_URL}/users/${id}`, data);
export const deleteUser = (id) => axios.delete(`${API_URL}/users/${id}`);

// Dashboard
export const getDashboardStats = () => axios.get(`${API_URL}/dashboard/stats`);

// Reports
export const getSalesReport = (params) => axios.get(`${API_URL}/reports/sales`, { params });
export const getInventoryReport = () => axios.get(`${API_URL}/reports/inventory`);
export const getProductPerformance = (params) => axios.get(`${API_URL}/reports/product-performance`, { params });
