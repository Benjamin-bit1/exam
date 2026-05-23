import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Nav, Navbar, Dropdown } from 'react-bootstrap';
import { FaHome, FaTags, FaTruck, FaBox, FaShoppingCart, FaChartBar, FaUsers, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="sidebar p-0">
          <div className="p-3">
            <h4 className="text-white mb-4">DAB Enterprise</h4>
            <Nav className="flex-column">
              <Nav.Link as={Link} to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
                <FaHome className="me-2" /> Dashboard
              </Nav.Link>
              {isAdmin() && (
                <Nav.Link as={Link} to="/categories" className={isActive('/categories') ? 'active' : ''}>
                  <FaTags className="me-2" /> Categories
                </Nav.Link>
              )}
              {isAdmin() && (
                <Nav.Link as={Link} to="/suppliers" className={isActive('/suppliers') ? 'active' : ''}>
                  <FaTruck className="me-2" /> Suppliers
                </Nav.Link>
              )}
              <Nav.Link as={Link} to="/products" className={isActive('/products') ? 'active' : ''}>
                <FaBox className="me-2" /> Products
              </Nav.Link>
              <Nav.Link as={Link} to="/sales" className={isActive('/sales') ? 'active' : ''}>
                <FaShoppingCart className="me-2" /> Sales
              </Nav.Link>
              <Nav.Link as={Link} to="/reports" className={isActive('/reports') ? 'active' : ''}>
                <FaChartBar className="me-2" /> Reports
              </Nav.Link>
              {isAdmin() && (
                <Nav.Link as={Link} to="/users" className={isActive('/users') ? 'active' : ''}>
                  <FaUsers className="me-2" /> Users
                </Nav.Link>
              )}
            </Nav>
          </div>
        </Col>

        <Col md={10} className="p-0">
          <Navbar bg="white" className="shadow-sm px-4 py-3">
            <Navbar.Brand className="fw-bold">Inventory & Sales Management</Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="user-dropdown">
                  <FaUser className="me-2" />
                  {user?.name}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    <FaUser className="me-2" /> Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Navbar.Collapse>
          </Navbar>

          <div className="p-4">
            {children}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;
