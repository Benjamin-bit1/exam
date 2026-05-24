import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Form, Button } from 'react-bootstrap';
import { FaDownload, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import * as api from '../services/api';

const Reports = () => {
  const [salesReport, setSalesReport] = useState([]);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [productPerformance, setProductPerformance] = useState([]);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [sales, inventory, performance] = await Promise.all([
        api.getSalesReport(dateRange),
        api.getInventoryReport(),
        api.getProductPerformance(dateRange)
      ]);
      setSalesReport(sales.data.data);
      setInventoryReport(inventory.data.data);
      setProductPerformance(performance.data.data);
    } catch (error) {
      toast.error('Error fetching reports');
    }
  };

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleGenerateReport = () => {
    fetchReports();
  };

  const calculateSalesTotals = () => {
    return salesReport.reduce((acc, item) => ({
      sales: acc.sales + parseInt(item.total_sales),
      revenue: acc.revenue + parseFloat(item.total_revenue)
    }), { sales: 0, revenue: 0 });
  };

  const totals = salesReport.length > 0 ? calculateSalesTotals() : { sales: 0, revenue: 0 };

  return (
    <Layout>
      <h2 className="mb-4">Reports</h2>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={dateRange.start_date}
                  onChange={handleDateChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={dateRange.end_date}
                  onChange={handleDateChange}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button variant="primary" onClick={handleGenerateReport}>
                <FaChartLine className="me-2" /> Generate Report
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Sales Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <div>
                  <h6 className="text-muted">Total Sales</h6>
                  <h3>{totals.sales}</h3>
                </div>
                <div className="text-end">
                  <h6 className="text-muted">Total Revenue</h6>
                  <h3>${totals.revenue.toFixed(2)}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Inventory Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <div>
                  <h6 className="text-muted">Total Products</h6>
                  <h3>{inventoryReport?.items?.length || 0}</h3>
                </div>
                <div className="text-end">
                  <h6 className="text-muted">Total Value</h6>
                  <h3>${inventoryReport?.totalValue?.toFixed(2) || '0.00'}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Daily Sales Report</h5>
          <Button variant="outline-primary" size="sm">
            <FaDownload className="me-2" /> Export
          </Button>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Sales</th>
                <th>Revenue</th>
                <th>Discount</th>
                <th>Tax</th>
              </tr>
            </thead>
            <tbody>
              {salesReport.map((item, index) => (
                <tr key={index}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.total_sales}</td>
                  <td>${parseFloat(item.total_revenue).toFixed(2)}</td>
                  <td>${parseFloat(item.total_discount).toFixed(2)}</td>
                  <td>${parseFloat(item.total_tax).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Product Performance</h5>
          <Button variant="outline-primary" size="sm">
            <FaDownload className="me-2" /> Export
          </Button>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Times Sold</th>
                <th>Quantity Sold</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {productPerformance.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.times_sold || 0}</td>
                  <td>{item.total_quantity_sold || 0}</td>
                  <td>${parseFloat(item.total_revenue || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Inventory Report</h5>
          <Button variant="outline-primary" size="sm">
            <FaDownload className="me-2" /> Export
          </Button>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Unit Price</th>
                <th>Stock</th>
                <th>Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {inventoryReport?.items?.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.category_name}</td>
                  <td>{item.supplier_name || 'N/A'}</td>
                  <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td>{item.quantity_in_stock}</td>
                  <td>${parseFloat(item.stock_value).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Layout>
  );
};

export default Reports;
