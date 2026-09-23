import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./PackageAdmin.css";
import "../components/Header.css";
import "../components/Footer.css";

const PackageAdmin = () => {
  const [packages, setPackages] = useState([
    {
      id: 1,
      name: "Basic Package",
      price: 1000,
      services: "Casket, Hearse, Funeral Home Services",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80",
    },
    {
      id: 2,
      name: "Standard Package",
      price: 2000,
      services: "Basic Package + Floral Arrangements",
      image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&q=80",
    },
    {
      id: 3,
      name: "Premium Package",
      price: 3500,
      services: "Standard Package + Catering & Procession",
      image: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&q=80",
    },
  ]);

  const handleDelete = (id) => {
    setPackages(packages.filter((pkg) => pkg.id !== id));
  };

  return (
    <div className="package-admin-container">
      {/* Navigation Bar */}
      <nav className="package-admin-navbar">
        <Link to="/packages">← Back to Packages</Link>
      </nav>

      {/* Package Table */}
      <h2>Package Management</h2>
      <div className="package-admin-table-wrapper">
        <table className="package-admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Preview</th>
              <th>Package Name</th>
              <th>Price</th>
              <th>Services Included</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td><strong>#{pkg.id}</strong></td>
                <td>
                  <img src={pkg.image} alt={pkg.name} className="package-image-preview" loading="lazy" />
                </td>
                <td><strong>{pkg.name}</strong></td>
                <td><span className="package-price-badge">${pkg.price.toLocaleString()}</span></td>
                <td>{pkg.services}</td>
                <td>
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(pkg.id)}>Delete</button>
                  <button className="view-btn">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PackageAdmin;
