import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar, Dropdown } from 'react-bootstrap';
import { FaHome, FaTags, FaTruck, FaBox, FaShoppingCart, FaChartBar, FaUsers, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} 
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="sidebar-header">
          <h4 className="text-white mb-0">DAB Enterprise</h4>
        </div>
        <div className="p-3">
          <Nav className="flex-column">
            <Nav.Link 
              as={Link} 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'active' : ''}
              onClick={closeSidebar}
            >
              <FaHome className="me-2" /> Dashboard
            </Nav.Link>
            {isAdmin() && (
              <Nav.Link 
                as={Link} 
                to="/categories" 
                className={isActive('/categories') ? 'active' : ''}
                onClick={closeSidebar}
              >
                <FaTags className="me-2" /> Categories
              </Nav.Link>
            )}
            {isAdmin() && (
              <Nav.Link 
                as={Link} 
                to="/suppliers" 
                className={isActive('/suppliers') ? 'active' : ''}
                onClick={closeSidebar}
              >
                <FaTruck className="me-2" /> Suppliers
              </Nav.Link>
            )}
            <Nav.Link 
              as={Link} 
              to="/products" 
              className={isActive('/products') ? 'active' : ''}
              onClick={closeSidebar}
            >
              <FaBox className="me-2" /> Products
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/sales" 
              className={isActive('/sales') ? 'active' : ''}
              onClick={closeSidebar}
            >
              <FaShoppingCart className="me-2" /> Sales
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/reports" 
              className={isActive('/reports') ? 'active' : ''}
              onClick={closeSidebar}
            >
              <FaChartBar className="me-2" /> Reports
            </Nav.Link>
            {isAdmin() && (
              <Nav.Link 
                as={Link} 
                to="/users" 
                className={isActive('/users') ? 'active' : ''}
                onClick={closeSidebar}
              >
                <FaUsers className="me-2" /> Users
              </Nav.Link>
            )}
          </Nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Navbar bg="white" className="top-navbar">
          <Navbar.Brand className="fw-bold">Inventory & Sales Management</Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" id="user-dropdown">
                <FaUser className="me-2" />
                <span className="hide-mobile">{user?.name}</span>
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

        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;
