import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Row, Col, Card } from 'react-bootstrap';
import { FaPlus, FaEye, FaTrash, FaMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import * as api from '../services/api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    payment_method: 'cash',
    payment_status: 'paid',
    discount: 0,
    tax: 0,
    notes: ''
  });

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await api.getSales();
      setSales(response.data.data);
    } catch (error) {
      toast.error('Error fetching sales');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts({ status: 'active' });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products');
    }
  };

  const handleShowModal = () => {
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      payment_method: 'cash',
      payment_status: 'paid',
      discount: 0,
      tax: 0,
      notes: ''
    });
    setCart([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleViewSale = async (sale) => {
    try {
      const response = await api.getSale(sale.id);
      setCurrentSale(response.data.data);
      setShowViewModal(true);
    } catch (error) {
      toast.error('Error fetching sale details');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      if (existing.quantity >= product.quantity_in_stock) {
        toast.error('Insufficient stock');
        return;
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        unit_price: product.unit_price,
        quantity: 1,
        max_stock: product.quantity_in_stock
      }]);
    }
  };

  const updateCartQuantity = (productId, quantity) => {
    const item = cart.find(i => i.product_id === productId);
    if (quantity > item.max_stock) {
      toast.error('Insufficient stock');
      return;
    }
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.product_id === productId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const discount = parseFloat(formData.discount) || 0;
    const tax = parseFloat(formData.tax) || 0;
    return {
      subtotal,
      discount,
      tax,
      total: subtotal - discount + tax
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Please add items to cart');
      return;
    }

    try {
      const totals = calculateTotal();
      await api.createSale({
        ...formData,
        items: cart,
        discount: totals.discount,
        tax: totals.tax
      });
      toast.success('Sale created successfully');
      fetchSales();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sale creation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale? Stock will be restored.')) {
      try {
        await api.deleteSale(id);
        toast.success('Sale deleted successfully');
        fetchSales();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const totals = calculateTotal();

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Sales</h2>
        <Button variant="primary" onClick={handleShowModal}>
          <FaPlus className="me-2" /> New Sale
        </Button>
      </div>

      <Table responsive hover>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.invoice_number}</td>
              <td>{sale.customer_name || 'Walk-in'}</td>
              <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
              <td>{sale.items_count}</td>
              <td>${parseFloat(sale.grand_total).toFixed(2)}</td>
              <td>{sale.payment_method}</td>
              <td>
                <Badge bg={sale.payment_status === 'paid' ? 'success' : 'warning'}>
                  {sale.payment_status}
                </Badge>
              </td>
              <td>
                <Button variant="info" size="sm" className="me-2" onClick={() => handleViewSale(sale)}>
                  <FaEye />
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(sale.id)}>
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* New Sale Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>New Sale</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={7}>
                <h5>Products</h5>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>${product.unit_price}</td>
                          <td>{product.quantity_in_stock}</td>
                          <td>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => addToCart(product)}
                              disabled={product.quantity_in_stock === 0}
                            >
                              <FaPlus />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Col>

              <Col md={5}>
                <h5>Cart</h5>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {cart.map((item) => (
                    <Card key={item.product_id} className="mb-2">
                      <Card.Body className="p-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{item.product_name}</strong>
                            <div className="text-muted small">${item.unit_price} each</div>
                          </div>
                          <div className="d-flex align-items-center">
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                            >
                              <FaMinus />
                            </Button>
                            <Form.Control
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateCartQuantity(item.product_id, parseInt(e.target.value))}
                              style={{ width: '60px', margin: '0 5px', textAlign: 'center' }}
                              min="1"
                              max={item.max_stock}
                            />
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                            >
                              <FaPlus />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="ms-2"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </div>
                        <div className="text-end mt-1">
                          <strong>${(item.unit_price * item.quantity).toFixed(2)}</strong>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>

                <hr />

                <Form.Group className="mb-2">
                  <Form.Label>Customer Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Customer Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Discount ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Tax ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="tax"
                    value={formData.tax}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </Form.Select>
                </Form.Group>

                <Card className="mt-3 bg-light">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <span>Subtotal:</span>
                      <strong>${totals.subtotal.toFixed(2)}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Discount:</span>
                      <strong>-${totals.discount.toFixed(2)}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Tax:</span>
                      <strong>+${totals.tax.toFixed(2)}</strong>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <h5>Total:</h5>
                      <h5>${totals.total.toFixed(2)}</h5>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Complete Sale
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Sale Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Sale Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentSale && (
            <>
              <Row>
                <Col md={6}>
                  <p><strong>Invoice:</strong> {currentSale.invoice_number}</p>
                  <p><strong>Customer:</strong> {currentSale.customer_name || 'Walk-in'}</p>
                  <p><strong>Phone:</strong> {currentSale.customer_phone || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Date:</strong> {new Date(currentSale.sale_date).toLocaleString()}</p>
                  <p><strong>Payment:</strong> {currentSale.payment_method}</p>
                  <p><strong>Status:</strong> {currentSale.payment_status}</p>
                </Col>
              </Row>

              <h5 className="mt-3">Items</h5>
              <Table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSale.items?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                      <td>${parseFloat(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="text-end">
                <p><strong>Subtotal:</strong> ${parseFloat(currentSale.total_amount).toFixed(2)}</p>
                <p><strong>Discount:</strong> -${parseFloat(currentSale.discount).toFixed(2)}</p>
                <p><strong>Tax:</strong> +${parseFloat(currentSale.tax).toFixed(2)}</p>
                <h5><strong>Grand Total:</strong> ${parseFloat(currentSale.grand_total).toFixed(2)}</h5>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Sales;
