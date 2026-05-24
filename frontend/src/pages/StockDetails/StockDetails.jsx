import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import "./StockDetails.css";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useReactToPrint } from 'react-to-print';
import totalIcon from '../../assets/total.png';
import inStockIcon from '../../assets/instock.png';
import lowStockIcon from '../../assets/lowstock.png';
import outOfStockIcon from '../../assets/outofstock.png';
// Import jsPDF and jspdf-autotable
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const StockDetails = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    orderDate: new Date().toISOString().split('T')[0],
    status: "In Stock",
    category: "other"
  });

  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/inventory");
      setInventory(response.data);
      setFilteredInventory(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch inventory. Please try again later.");
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    let result = [...inventory];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(item => 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      const statusMap = {
        'instock': 'In Stock',
        'lowstock': 'Low Stock',
        'outofstock': 'Out of Stock'
      };
      result = result.filter(item => item.status === statusMap[statusFilter]);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter(item => item.category === categoryFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredInventory(result);
  }, [inventory, searchTerm, statusFilter, categoryFilter, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const deleteInventory = async (id) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this inventory item?");
      if (confirmDelete) {
        await axios.delete(`http://localhost:5000/inventory/${id}`);
        setInventory(inventory.filter(item => item._id !== id));
        toast.success('Item deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (err) {
      toast.error('Failed to delete item. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Error deleting inventory:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateInventory = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/inventory/${id}`, formData);
      setInventory(inventory.map(item => 
        item._id === id ? response.data : item
      ));
      setEditingItem(null);
      setFormData({
        productName: "",
        quantity: "",
        orderDate: "",
        status: "",
        category: ""
      });
      toast.success('Item updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      toast.error('Failed to update item. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Error updating inventory:", err);
    }
  };

  const startEdit = (item) => {
    setEditingItem(item._id);
    setFormData({
      productName: item.productName,
      quantity: item.quantity,
      orderDate: item.orderDate ? new Date(item.orderDate).toISOString().split('T')[0] : '',
      status: item.status,
      category: item.category
    });
  };

  const handleKeyPress = useCallback((e) => {
    if (editingItem) {
      if (e.key === 'Escape') {
        setEditingItem(null);
        toast.info('Edit cancelled', {
          position: "top-right",
          autoClose: 2000,
        });
      } else if (e.key === 'Enter' && !e.shiftKey) {
        updateInventory(editingItem);
      }
    }
  }, [editingItem]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/inventory", formData);
      setInventory([...inventory, response.data]);
      setShowAddForm(false);
      setFormData({
        productName: "",
        quantity: "",
        orderDate: new Date().toISOString().split('T')[0],
        status: "In Stock",
        category: "other"
      });
      toast.success('Inventory item added successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Failed to add item. Please try again.', {
        position: "top-right",
        autoClose: 5000,
      });
      console.error("Error adding inventory:", err);
    }
  };

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Inventory Report',
    onAfterPrint: () => toast.success('Report downloaded successfully!'),
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title and date
    doc.setFontSize(18);
    doc.text('Stock Details Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    
    // Add inventory statistics
    doc.setFontSize(12);
    doc.text('Inventory Statistics:', 14, 42);
    const totalItems = filteredInventory.length;
    const inStockItems = filteredInventory.filter(item => item.status === 'In Stock').length;
    const lowStockItems = filteredInventory.filter(item => item.status === 'Low Stock').length;
    const outOfStockItems = filteredInventory.filter(item => item.status === 'Out of Stock').length;
    
    doc.text(`Total Items: ${totalItems}`, 14, 52);
    doc.text(`In Stock: ${inStockItems}`, 14, 62);
    doc.text(`Low Stock: ${lowStockItems}`, 14, 72);
    doc.text(`Out of Stock: ${outOfStockItems}`, 14, 82);
    
    // Prepare table data
    const tableColumn = ["Product Name", "Category", "Quantity", "Status", "Last Updated"];
    const tableRows = filteredInventory.map(item => [
      item.productName,
      item.category,
      item.quantity,
      item.status,
      new Date(item.orderDate).toLocaleDateString()
    ]);    // Add inventory table
    autoTable(doc, {
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 }
      }
    });

    // Save the PDF
    doc.save('stock-details-report.pdf');
    toast.success('Report downloaded successfully!');
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading inventory items..." />;
  }

  return (
    <div className="inventory-container">
      <ToastContainer />
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <div className="header-buttons">
          <button className="download-btn" onClick={generatePDF}>
            Download Report
          </button>
          <button 
            className="add-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel Add' : '+Add New Item'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="add-form-container card">
          <h3>Add New Inventory Item</h3>
          <form onSubmit={handleAddSubmit} className="inventory-form">
            <div className="form-group">
              <label htmlFor="productName">Product Name</label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                required
                placeholder="Enter product name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                placeholder="Enter quantity"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="orderDate">Order Date</label>
              <input
                type="date"
                id="orderDate"
                name="orderDate"
                value={formData.orderDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="Cascket">Cascket</option>
                <option value="Flowers">Flowers</option>
                <option value="Decorations">Decorations</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button type="submit" className="submit-btn">
              Add Inventory Item
            </button>
          </form>
        </div>
      )}

      <div className="inventory-stats">        
        <div className="stat-card total">
          <div className="stat-content">
            <div className="stat-text">
              <h3>Total Items</h3>
              <p>{filteredInventory.length}</p>
            </div>
            <div className="stat-icon-container">
              <img src={totalIcon} alt="Total Items" className="stat-icon" />
            </div>
          </div>
        </div>
        <div className="stat-card in-stock">
          <div className="stat-content">
            <div className="stat-text">
              <h3>In Stock</h3>
              <p>{filteredInventory.filter(item => item.status === "In Stock").length}</p>
            </div>
            <div className="stat-icon-container">
              <img src={inStockIcon} alt="In Stock" className="stat-icon" />
            </div>
          </div>
        </div>
        <div className="stat-card low-stock">
          <div className="stat-content">
            <div className="stat-text">
              <h3>Low Stock</h3>
              <p>{filteredInventory.filter(item => item.status === "Low Stock").length}</p>
            </div>
            <div className="stat-icon-container">
              <img src={lowStockIcon} alt="Low Stock" className="stat-icon" />
            </div>
          </div>
        </div>
        <div className="stat-card out-of-stock">
          <div className="stat-content">
            <div className="stat-text">
              <h3>Out of Stock</h3>
              <p>{filteredInventory.filter(item => item.status === "Out of Stock").length}</p>
            </div>
            <div className="stat-icon-container">
              <img src={outOfStockIcon} alt="Out of Stock" className="stat-icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="status-filter">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="instock">In Stock</option>
            <option value="lowstock">Low Stock</option>
            <option value="outofstock">Out of Stock</option>
          </select>
        </div>

        <div className="category-filter">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="Cascket">Cascket</option>
            <option value="Flowers">Flowers</option>
            <option value="Decorations">Decorations</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="inventory-table-container card" ref={componentRef}>
        <table className="inventory-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('productName')} className="sortable">
                Product Name {sortConfig.key === 'productName' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('category')} className="sortable">
                Category {sortConfig.key === 'category' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('quantity')} className="sortable">
                Quantity {sortConfig.key === 'quantity' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('orderDate')} className="sortable">
                Order Date {sortConfig.key === 'orderDate' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('status')} className="sortable">
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item._id}>
                <td>
                  {editingItem === item._id ? (
                    <input
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    item.productName
                  )}
                </td>
                <td>
                  {editingItem === item._id ? (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="edit-input"
                    >
                      <option value="Cascket">Cascket</option>
                      <option value="Flowers">Flowers</option>
                      <option value="Decorations">Decorations</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    item.category
                  )}
                </td>
                <td>
                  {editingItem === item._id ? (
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="edit-input"
                      min="0"
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td>
                  {editingItem === item._id ? (
                    <input
                      type="date"
                      name="orderDate"
                      value={formData.orderDate}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    new Date(item.orderDate).toLocaleDateString()
                  )}
                </td>
                <td>
                  {editingItem === item._id ? (
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="edit-input"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${item.status}`}>
                      {item.status}
                    </span>
                  )}
                </td>
                <td className="action-buttons">
                  {editingItem === item._id ? (
                    <>
                      <button 
                        className="save-btn"
                        onClick={() => updateInventory(item._id)}
                      >
                        Save
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={() => setEditingItem(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="edit-btn"
                        onClick={() => startEdit(item)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteInventory(item._id)}
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

export default StockDetails;