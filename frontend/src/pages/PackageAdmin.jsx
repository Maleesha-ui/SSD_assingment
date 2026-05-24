import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./PackageAdmin.css";
import "../components/Header.css";  // Corrected import path
import "../components/Footer.css";  // Corrected import path


const PackageAdmin = () => {
  const [packages, setPackages] = useState([
    {
      id: 1,
      name: "Basic Package",
      price: 1000,
      services: "Casket, Hearse, Funeral Home Services",
      image: "", // No image
    },
    {
      id: 2,
      name: "Standard Package",
      price: 2000,
      services: "Basic Package + Floral Arrangements",
      image: "", // No image
    },
    {
      id: 3,
      name: "Premium Package",
      price: 3500,
      services: "Standard Package + Catering & Procession",
      image: "", // No image
    },
  ]);

  const handleDelete = (id) => {
    setPackages(packages.filter((pkg) => pkg.id !== id));
  };

  return (
    <div className="package-admin-container">
      {/* Navigation Bar */}
      <nav className="package-admin-navbar">
        <Link to="/packages">Packages</Link>
      </nav>

      {/* Package Table */}
      <h2>Package Management</h2>
      <table className="package-admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Package Name</th>
            <th>Price ($)</th>
            <th>Services Included</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <tr key={pkg.id}>
              <td>{pkg.id}</td>
              <td>{pkg.name}</td>
              <td>{pkg.price}</td>
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
  );
};

export default PackageAdmin;
