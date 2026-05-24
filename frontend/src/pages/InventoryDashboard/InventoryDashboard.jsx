import { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import "./InventoryDashboard.css";
import InventoryNavigationBar from "../../components/InventoryNavigationBar/InventoryNavigationBar";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function InventoryDashboard() {
  const [inventoryData, setInventoryData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);

  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/inventory");
      setInventoryData(response.data);
      // Filter low stock items
      const lowStock = response.data.filter(item => item.quantity < 10);
      setLowStockItems(lowStock);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  };

  // Update current date and fetch data every minute
  useEffect(() => {
    fetchInventoryData();
    
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
      fetchInventoryData();
    }, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  // Process data for the chart
  const chartData = {
  labels: ['Cascket', 'Flowers', 'Decorations', 'Other'],
  datasets: [
    {
      label: 'Quantity in Stock',
      data: ['Cascket', 'Flowers', 'Decorations', 'Other'].map(category => {
        const items = inventoryData.filter(item => item.category === category);
        return items.reduce((sum, item) => sum + item.quantity, 0);
      }),
      backgroundColor: [
        'rgba(73, 46, 17, 0.6)',     
        'rgba(128, 0, 128, 0.6)',     
        'rgba(218, 165, 32, 0.6)',   
        'rgba(218, 165, 32, 0.6)',    
      ],
      borderColor: [
        'rgba(60, 60, 60, 1)',        
        'rgba(128, 0, 128, 1)',      
        'rgba(105, 105, 105, 1)',     
        'rgba(218, 165, 32, 1)',      
      ],
      borderWidth: 1,
    },
  ],
};


  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Inventory Levels by Category',
        font: {
          size: 28
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity',
          
          textcolor: 'black',
          font: {
            size: 15
          }
        }
        
      },
      x: {
        title: {
          display: true,
          text: 'Category',
          textcolor: 'black',
          font: {
            size: 15
          }
        }
      }
    }
  };

  const toggleLowStockModal = () => {
    setShowLowStockModal(!showLowStockModal);
  };

  return (
    
    <div className="welcome-container">
      <InventoryNavigationBar />
      <h1>INVENTORY DASHBOARD</h1>      <p className="current-date">
        {currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          
        })}
      </p>
      
      {lowStockItems.length > 0 && (
        <div className="dashboard-stats">
          <div className="stat-card low-stock" onClick={toggleLowStockModal}>
            <img src="/src/assets/lowstock.png" alt="Low Stock" className="stat-icon" />
            <div className="stat-info">
              <h3>Low Stock Alert</h3>
              <p>{lowStockItems.length} Items Low on Stock</p>
            </div>
          </div>
        </div>
      )}

      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>

      {showLowStockModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Low Stock Items</h2>
              <button onClick={toggleLowStockModal} className="close-button">&times;</button>
            </div>
            <div className="modal-body">
              <table className="low-stock-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item._id}>
                      <td>{item.itemName}</td>
                      <td>{item.category}</td>
                      <td className="quantity-low">{item.quantity}</td>
                      <td>${item.unitPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryDashboard;