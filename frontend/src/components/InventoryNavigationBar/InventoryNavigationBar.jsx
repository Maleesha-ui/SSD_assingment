import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './InventoryNavigationBar.css';

const InventoryNavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Add logout logic here when needed
    console.log('Logout clicked');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/" className="nav-logo"></NavLink>
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
        </button>
      </div>
      <div className="nav-actions">
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <NavLink to="/ind" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/inventory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Inventory
            </NavLink>
          </li>
          <li>
            <NavLink to="/inventory-orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink to="/suppliers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Suppliers
            </NavLink>
          </li>
        </ul>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default InventoryNavigationBar;
