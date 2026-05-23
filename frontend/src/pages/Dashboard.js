import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { FaBox, FaExclamationTriangle, FaShoppingCart, FaDollarSign } from 'react-icons/fa';
import Layout from '../components/Layout';
import * as api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Layout><div className="text-center">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <h2 className="mb-4">Dashboard</h2>

      <Row>
        <Col md={3}>
          <Card className="stat-card bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6>Total Products</h6>
                  <h3>{stats?.totalProducts || 0}</h3>
                </div>
                <FaBox size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card bg-warning text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6>Low Stock Items</h6>
                  <h3>{stats?.lowStockCount || 0}</h3>
                </div>
                <FaExclamationTriangle size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6>Today's Sales</h6>
                  <h3>{stats?.todaySales?.count || 0}</h3>
                </div>
                <FaShoppingCart size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card bg-info text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6>Today's Revenue</h6>
                  <h3>${stats?.todaySales?.total?.toFixed(2) || '0.00'}</h3>
                </div>
                <FaDollarSign size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Recent Sales</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentSales?.slice(0, 5).map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.invoice_number}</td>
                      <td>{sale.customer_name || 'Walk-in'}</td>
                      <td>${sale.grand_total}</td>
                      <td>
                        <Badge bg={sale.payment_status === 'paid' ? 'success' : 'warning'}>
                          {sale.payment_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Low Stock Alert</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Stock</th>
                    <th>Reorder Level</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.lowStockProducts?.slice(0, 5).map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>
                        <Badge bg="danger">{product.quantity_in_stock}</Badge>
                      </td>
                      <td>{product.reorder_level}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default Dashboard;
