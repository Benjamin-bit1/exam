import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import * as api from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    supplier_id: '',
    description: '',
    unit_price: '',
    quantity_in_stock: '',
    reorder_level: '',
    status: 'active'
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts();
      setProducts(response.data.data);
    } catch (error) {
      toast.error('Error fetching products');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories({ status: 'active' });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.getSuppliers({ status: 'active' });
      setSuppliers(response.data.data);
    } catch (error) {
      console.error('Error fetching suppliers');
    }
  };

  const handleShowModal = (product = null) => {
    if (product) {
      setEditMode(true);
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        category_id: product.category_id,
        supplier_id: product.supplier_id || '',
        description: product.description || '',
        unit_price: product.unit_price,
        quantity_in_stock: product.quantity_in_stock,
        reorder_level: product.reorder_level,
        status: product.status
      });
    } else {
      setEditMode(false);
      setCurrentProduct(null);
      setFormData({
        name: '',
        sku: '',
        category_id: '',
        supplier_id: '',
        description: '',
        unit_price: '',
        quantity_in_stock: '',
        reorder_level: '10',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentProduct(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.updateProduct(currentProduct.id, formData);
        toast.success('Product updated successfully');
      } else {
        await api.createProduct(formData);
        toast.success('Product created successfully');
      }
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <h2 className="mb-0">Products</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <FaPlus className="me-2" /> Add Product
        </Button>
      </div>

      <InputGroup className="mb-3">
        <InputGroup.Text>
          <FaSearch />
        </InputGroup.Text>
        <Form.Control
          placeholder="Search products by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      <div className="table-responsive">
        <Table hover>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th className="hide-mobile">Category</th>
              <th className="hide-mobile">Supplier</th>
              <th>Price</th>
              <th>Stock</th>
              <th className="hide-mobile">Reorder Level</th>
              <th className="hide-mobile">Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="text-truncate-mobile">{product.sku}</td>
                <td className="text-truncate-mobile">{product.name}</td>
                <td className="hide-mobile">{product.category_name}</td>
                <td className="hide-mobile">{product.supplier_name || 'N/A'}</td>
                <td>${product.unit_price}</td>
                <td>
                  <Badge bg={product.quantity_in_stock <= product.reorder_level ? 'danger' : 'success'}>
                    {product.quantity_in_stock}
                  </Badge>
                </td>
                <td className="hide-mobile">{product.reorder_level}</td>
                <td className="hide-mobile">
                  <Badge bg={product.status === 'active' ? 'success' : 'secondary'}>
                    {product.status}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button variant="warning" size="sm" onClick={() => handleShowModal(product)}>
                      <FaEdit />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)}>
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" fullscreen="md-down">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Product Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>SKU *</Form.Label>
              <Form.Control
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category *</Form.Label>
              <Form.Select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Supplier</Form.Label>
              <Form.Select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Unit Price *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantity in Stock *</Form.Label>
              <Form.Control
                type="number"
                name="quantity_in_stock"
                value={formData.quantity_in_stock}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reorder Level *</Form.Label>
              <Form.Control
                type="number"
                name="reorder_level"
                value={formData.reorder_level}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Products;
