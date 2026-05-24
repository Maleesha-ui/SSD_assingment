import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InventoryOrderDetails.css';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import totalOrderIcon from '../../assets/totalor.png';
import completedIcon from '../../assets/completed.png';
import pendingIcon from '../../assets/pending.png';
import cancelIcon from '../../assets/cancel.png';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const InventoryOrderDetails = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    inventoryItemName: '',
    inventoryItemCategory: 'other',
    quantityOrdered: '',
    supplierName: '',
    inventoryOrderDate: new Date().toISOString().split('T')[0],
    inventoryOrderStatus: 'pending'
  });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, categoryFilter]);

  useEffect(() => {
    calculateOrderStats();
  }, [filteredOrders]);

  const calculateOrderStats = () => {
    const stats = {
      total: filteredOrders.length,
      completed: filteredOrders.filter(order => order.inventoryOrderStatus.toLowerCase() === 'completed').length,
      pending: filteredOrders.filter(order => order.inventoryOrderStatus.toLowerCase() === 'pending').length,
      cancelled: filteredOrders.filter(order => order.inventoryOrderStatus.toLowerCase() === 'cancelled').length
    };
    setOrderStats(stats);
  };

  const filterOrders = () => {
    let result = [...orders];
    
    if (statusFilter !== 'all') {
      result = result.filter(order => order.inventoryOrderStatus === statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(order => order.inventoryItemCategory === categoryFilter);
    }
    
    setFilteredOrders(result);
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/inventoryorder');
      setOrders(response.data);
      setFilteredOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch inventory orders');
      setLoading(false);
      console.error('Error fetching orders:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`http://localhost:5000/inventoryorder/${id}`);
        toast.success('Order deleted successfully!');
        fetchOrders(); // Refresh the list
      } catch (err) {
        toast.error('Failed to delete order');
        console.error('Error deleting order:', err);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-badge completed';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge pending';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      inventoryItemName: '',
      inventoryItemCategory: 'other',
      quantityOrdered: '',
      supplierName: '',
      inventoryOrderDate: new Date().toISOString().split('T')[0],
      inventoryOrderStatus: 'pending'
    });
    setEditingOrder(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        await axios.put(`http://localhost:5000/inventoryorder/${editingOrder}`, formData);
        toast.success('Order updated successfully!');
      } else {
        await axios.post('http://localhost:5000/inventoryorder', formData);
        toast.success('Order added successfully!');
      }
      fetchOrders();
      resetForm();
    } catch (err) {
      toast.error(editingOrder ? 'Failed to update order' : 'Failed to add order');
      console.error('Error:', err);
    }
  };

  const startEdit = (order) => {
    setFormData({
      inventoryItemName: order.inventoryItemName,
      inventoryItemCategory: order.inventoryItemCategory,
      quantityOrdered: order.quantityOrdered,
      supplierName: order.supplierName,
      inventoryOrderDate: new Date(order.inventoryOrderDate).toISOString().split('T')[0],
      inventoryOrderStatus: order.inventoryOrderStatus
    });
    setEditingOrder(order._id);
    setShowAddForm(true);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title and date
    doc.setFontSize(18);
    doc.text('Inventory Orders Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    
    // Add order statistics
    doc.setFontSize(12);
    doc.text('Order Statistics:', 14, 42);
    doc.text(`Total Orders: ${orderStats.total}`, 14, 52);
    doc.text(`Completed Orders: ${orderStats.completed}`, 14, 62);
    doc.text(`Pending Orders: ${orderStats.pending}`, 14, 72);
    doc.text(`Cancelled Orders: ${orderStats.cancelled}`, 14, 82);
    
    // Prepare table data
    const tableColumn = ["Item Name", "Category", "Quantity", "Supplier", "Order Date", "Status"];
    const tableRows = filteredOrders.map(order => [
      order.inventoryItemName,
      order.inventoryItemCategory,
      order.quantityOrdered,
      order.supplierName,
      new Date(order.inventoryOrderDate).toLocaleDateString(),
      order.inventoryOrderStatus
    ]);

    // Add orders table
    autoTable(doc, {
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
        5: { cellWidth: 25 }
      }
    });

    // Save the PDF
    doc.save('inventory-orders-report.pdf');
    toast.success('Report downloaded successfully!');
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading inventory orders..." />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="inventory-orders-container">
      <ToastContainer />      <div className="inventory-header">
        <h2>Inventory Orders</h2>
        <div className="header-buttons">
          <button 
            className="generate-pdf-btn"
            onClick={generatePDF}
          >
            Generate PDF
          </button>
          <button 
            className="add-order-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+Add New Order'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="order-form-section">
          <h3>{editingOrder ? 'Edit Order' : 'Add New Order'}</h3>
          <form onSubmit={handleSubmit} className="order-form">
            <div className="form-group">
              <label htmlFor="inventoryItemName">Item Name</label>
              <input
                type="text"
                id="inventoryItemName"
                name="inventoryItemName"
                value={formData.inventoryItemName}
                onChange={handleInputChange}
                required
                placeholder="Enter item name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="inventoryItemCategory">Category</label>
              <select
                id="inventoryItemCategory"
                name="inventoryItemCategory"
                value={formData.inventoryItemCategory}
                onChange={handleInputChange}
                required
              >
                <option value="Cascket">Cascket</option>
                <option value="Flowers">Flowers</option>
                <option value="Decorations">Decorations</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantityOrdered">Quantity</label>
              <input
                type="number"
                id="quantityOrdered"
                name="quantityOrdered"
                value={formData.quantityOrdered}
                onChange={handleInputChange}
                required
                placeholder="Enter quantity"
                min="1"
              />
            </div>

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
              <label htmlFor="inventoryOrderDate">Order Date</label>
              <input
                type="date"
                id="inventoryOrderDate"
                name="inventoryOrderDate"
                value={formData.inventoryOrderDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="inventoryOrderStatus">Status</label>
              <select
                id="inventoryOrderStatus"
                name="inventoryOrderStatus"
                value={formData.inventoryOrderStatus}
                onChange={handleInputChange}
                required
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingOrder ? 'Update Order' : 'Add Order'}
              </button>
              {editingOrder && (
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="statistics-section">
        <div className="stat-item">
          <div className="stat-content">
            <div className="stat-text">
              <h3>Total Orders</h3>
              <p>{orderStats.total}</p>
            </div>
            <img src={totalOrderIcon} alt="Total Orders" className="stat-icon" />
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-content">
            <div className="stat-text">
              <h3>Completed</h3>
              <p>{orderStats.completed}</p>
            </div>
            <img src={completedIcon} alt="Completed" className="stat-icon" />
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-content">
            <div className="stat-text">
              <h3>Pending</h3>
              <p>{orderStats.pending}</p>
            </div>
            <img src={pendingIcon} alt="Pending" className="stat-icon" />
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-content">
            <div className="stat-text">
              <h3>Cancelled</h3>
              <p>{orderStats.cancelled}</p>
            </div>
            <img src={cancelIcon} alt="Cancelled" className="stat-icon" />
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="Cascket">Cascket</option>
            <option value="Flowers">Flowers</option>
            <option value="Decorations">Decorations</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="orders-grid">
        <div className="orders-header">
          <div>Item Name</div>
          <div>Category</div>
          <div>Quantity</div>
          <div>Supplier</div>
          <div>Order Date</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {filteredOrders.map((order) => (
          <div key={order._id} className="order-row">
            <div>{order.inventoryItemName}</div>
            <div>{order.inventoryItemCategory}</div>
            <div>{order.quantityOrdered}</div>
            <div>{order.supplierName}</div>
            <div>{new Date(order.inventoryOrderDate).toLocaleDateString()}</div>
            <div>
              <span className={getStatusBadgeClass(order.inventoryOrderStatus)}>
                {order.inventoryOrderStatus}
              </span>
            </div>
            <div className="actions">
              <button 
                className="edit-btn"
                onClick={() => startEdit(order)}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(order._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="no-orders">No inventory orders found</div>
      )}
    </div>
  );
};

export default InventoryOrderDetails;