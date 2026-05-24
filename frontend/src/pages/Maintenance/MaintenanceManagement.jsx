import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MaintenanceManagement.css";

const URL = "http://localhost:5000/maintenance/all";

const fetchHandler = async () => {
  try {
    const res = await axios.get(URL);
    if (!res.data.maintenance) {
      throw new Error("Invalid data format from server");
    }
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    return { maintenance: [] }; // Safe fallback
  }
};

function MaintenanceManagement() {
  const navigate = useNavigate();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [updatedRecord, setUpdatedRecord] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    // Fetch maintenance records
    fetchHandler().then((data) => setMaintenanceRecords(data.maintenance));
    // Fetch vehicles for dropdown
    axios.get("http://localhost:5000/vehicles").then((res) => setVehicles(res.data.vehicles));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`http://localhost:5000/maintenance/${id}`, updatedRecord);
      setEditingRecordId(null);
      fetchHandler().then((data) => setMaintenanceRecords(data.maintenance));
    } catch (error) {
      console.error("Error saving maintenance record:", error);
      alert("Failed to save maintenance record.");
    }
  };

  const deleteHandler = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/maintenance/${id}`);
      fetchHandler().then((data) => setMaintenanceRecords(data.maintenance));
    } catch (error) {
      console.error("Error deleting maintenance record:", error);
      alert("Failed to delete maintenance record.");
    }
  };

  const handleSearch = () => {
    fetchHandler().then((data) => {
      const filteredRecords = data.maintenance.filter((record) =>
        [record.service_type, record.vehicle_id?.vehicleModel]
          .some((field) =>
            field?.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      setMaintenanceRecords(filteredRecords);
      setNoResults(filteredRecords.length === 0);
    });
  };

  return (
    <div className="maintenance-management-container">
      <div className="maintenance-management-header">
        <h1>Vehicle Maintenance Management</h1>
        <div className="header-actions">
          <div className="search-container">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              className="search-bar"
              placeholder="Search maintenance records..."
            />
            <button className="search-btn" onClick={handleSearch}>
              <i className="fas fa-search"></i> Search
            </button>
          </div>
          <button
            className="add-btn"
            onClick={() => navigate("/maintenanceregistration")}
          >
            <i className="fas fa-plus"></i> Add Maintenance Record
          </button>
          <button
            className="report-btn"
            onClick={() => navigate("/maintenancereport")}
          >
            <i className="fas fa-file-alt"></i> View Report
          </button>
        </div>
      </div>

      {noResults ? (
        <div className="no-results">
          <p>No maintenance records found matching your search criteria</p>
        </div>
      ) : (
        <div className="maintenance-table-container">
          <table className="maintenance-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Service Date</th>
                <th>Cost</th>
                <th>Next Service Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRecords && maintenanceRecords.map((record, i) => (
                <tr key={i}>
                  <td>
                    {editingRecordId === record._id ? (
                      <select
                        name="vehicle_id"
                        value={updatedRecord.vehicle_id || ""}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Vehicle</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle._id} value={vehicle._id}>
                            {vehicle.vehicleModel} ({vehicle.vehicleNumber})
                          </option>
                        ))}
                      </select>
                    ) : (
                      record.vehicle_id?.vehicleModel || "Unknown"
                    )}
                  </td>
                  <td>
                    {editingRecordId === record._id ? (
                      <input
                        type="text"
                        name="service_type"
                        value={updatedRecord.service_type || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      record.service_type
                    )}
                  </td>
                  <td>
                    {editingRecordId === record._id ? (
                      <input
                        type="date"
                        name="service_date"
                        value={updatedRecord.service_date ? new Date(updatedRecord.service_date).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      new Date(record.service_date).toLocaleDateString()
                    )}
                  </td>
                  <td>
                    {editingRecordId === record._id ? (
                      <input
                        type="number"
                        name="cost"
                        value={updatedRecord.cost || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      record.cost
                    )}
                  </td>
                  <td>
                    {editingRecordId === record._id ? (
                      <input
                        type="date"
                        name="next_service_date"
                        value={updatedRecord.next_service_date ? new Date(updatedRecord.next_service_date).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      new Date(record.next_service_date).toLocaleDateString()
                    )}
                  </td>
                  <td className="action-buttons">
                    {editingRecordId === record._id ? (
                      <>
                        <button
                          className="save-btn"
                          onClick={() => handleSave(record._id)}
                        >
                          <i className="fas fa-save"></i> Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => {
                            setEditingRecordId(null);
                            setUpdatedRecord({});
                          }}
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingRecordId(record._id);
                          setUpdatedRecord({ ...record });
                        }}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                    )}
                    <button
                      className="delete-btn"
                      onClick={() => deleteHandler(record._id)}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MaintenanceManagement;