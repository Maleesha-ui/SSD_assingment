import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SupplierDetails.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    supplierName: "",
    contactNumber: "",
    email: "",
    address: "",
    suppliedItems: "",
    companyName: "",
  });

  // Fetch suppliers from backend
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/supplier");
      setSuppliers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch suppliers. Please try again later.");
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Delete supplier
  const deleteSupplier = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await axios.delete(`http://localhost:5000/supplier/${id}`);
        setSuppliers(suppliers.filter(supplier => supplier._id !== id));
        toast.success('Supplier deleted successfully!');
      } catch (err) {
        toast.error('Failed to delete supplier. Please try again.');
        console.error("Error deleting supplier:", err);
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new supplier
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/supplier', formData);
      setSuppliers([...suppliers, response.data]);
      setShowAddForm(false);
      setFormData({
        supplierName: "",
        contactNumber: "",
        email: "",
        address: "",
        suppliedItems: "",
        companyName: "",
      });
      toast.success('Supplier added successfully!');
    } catch (err) {
      toast.error('Failed to add supplier. Please try again.');
      console.error('Error adding supplier:', err);
    }
  };

  // Update supplier
  const updateSupplier = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/supplier/${id}`, formData);
      setSuppliers(suppliers.map(supplier => 
        supplier._id === id ? response.data : supplier
      ));
      setEditingSupplier(null);
      setFormData({
        supplierName: "",
        contactNumber: "",
        email: "",
        address: "",
        suppliedItems: "",
        companyName: "",
      });
      toast.success('Supplier updated successfully!');
    } catch (err) {
      toast.error('Failed to update supplier. Please try again.');
      console.error("Error updating supplier:", err);
    }
  };

  // Start editing a supplier
  const startEdit = (supplier) => {
    setEditingSupplier(supplier._id);
    setFormData(supplier);
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="supplier-container">
      <ToastContainer />
      <div className="supplier-header">
        <h2>Supplier Management</h2>
        <div className="header-controls">
          <p>Total Suppliers: {suppliers.length}</p>
          <button 
            className="add-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+Add New Supplier'}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showAddForm && (
        <div className="add-form-container">
          <h3>Add New Supplier</h3>
          <form onSubmit={handleAddSubmit} className="supplier-form">
            <div className="form-group">
              <label htmlFor="supplierName">Supplier Name</label>
              <input
                type="text"
                id="supplierName"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleInputChange}
                required
                placeholder="Enter supplier name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
                placeholder="Enter contact number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Enter address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="suppliedItems">Supplied Items</label>
              <input
                type="text"
                id="suppliedItems"
                name="suppliedItems"
                value={formData.suppliedItems}
                onChange={handleInputChange}
                required
                placeholder="Enter supplied items"
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                placeholder="Enter company name"
              />
            </div>

            <button type="submit" className="submit-btn">Add Supplier</button>
          </form>
        </div>
      )}

      <div className="supplier-table-container">
        <table className="supplier-table">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Address</th>
              <th>Supplied Items</th>
              <th>Company Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier._id}>
                <td>
                  {editingSupplier === supplier._id ? (
                    <input
                      type="text"
                      name="supplierName"
                      value={formData.supplierName}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    supplier.supplierName
                  )}
                </td>
                <td>
                  {editingSupplier === supplier._id ? (
                    <input
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    supplier.contactNumber
                  )}
                </td>
                <td>
                  {editingSupplier === supplier._id ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    supplier.email
                  )}
                </td>
                <td>
                  {editingSupplier === supplier._id ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    supplier.address
                  )}
                </td>
                <td>
                  {editingSupplier === supplier._id ? (
                    <input
                      type="text"
                      name="suppliedItems"
                      value={formData.suppliedItems}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    supplier.suppliedItems
                  )}
                </td>
                <td>
                  {editingSupplier === supplier._id ? (
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    supplier.companyName
                  )}
                </td>
                <td className="action-buttons">
                  {editingSupplier === supplier._id ? (
                    <>
                      <button 
                        className="save-btn"
                        onClick={() => updateSupplier(supplier._id)}
                      >
                        Save
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={() => setEditingSupplier(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="edit-btn"
                        onClick={() => startEdit(supplier)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteSupplier(supplier._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierPage;
