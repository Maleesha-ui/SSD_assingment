import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./VehicleManagement.css";

const URL = "http://localhost:5000/vehicles";

const fetchhandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function VehicleManagement() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [updatedVehicle, setUpdatedVehicle] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    fetchhandler().then((data) => setVehicles(data.vehicles));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedVehicle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`http://localhost:5000/vehicles/${id}`, updatedVehicle);
      setEditingVehicleId(null);
      fetchhandler().then((data) => setVehicles(data.vehicles));
    } catch (error) {
      console.error("Error saving Vehicle:", error);
      alert("Failed to save vehicle.");
    }
  };

  const deleteHandler = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/vehicles/${id}`);
      fetchhandler().then((data) => setVehicles(data.vehicles));
    } catch (error) {
      console.error("Error deleting Vehicle:", error);
      alert("Failed to delete vehicle.");
    }
  };

  const handleSearch = () => {
    fetchhandler().then((data) => {
      const filteredVehicles = data.vehicles.filter((vehicle) =>
        [vehicle.vehicleNumber, vehicle.vehicleType, vehicle.vehicleModel]
          .some((field) =>
            field.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      setVehicles(filteredVehicles);
      setNoResults(filteredVehicles.length === 0);
    });
  };

  return (
    <div className="vehicle-management-container">
      <div className="vehicle-management-header">
        <h1>Vehicle Management</h1>
        <div className="header-actions">
          <div className="search-container">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              className="search-bar"
              placeholder="Search vehicles..."
            />
            <button className="search-btn" onClick={handleSearch}>
              <i className="fas fa-search"></i> Search
            </button>
          </div>
          <button 
            className="add-btn"
            onClick={() => navigate("/vehicleregistration")}
          >
            <i className="fas fa-plus"></i> Add Vehicle
          </button>
        </div>
      </div>

      {noResults ? (
        <div className="no-results">
          <p>No vehicles found matching your search criteria</p>
        </div>
      ) : (
        <div className="vehicle-table-container">
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Vehicle Type</th>
                <th>Vehicle Model</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles && vehicles.map((vehicle, i) => (
                <tr key={i}>
                  <td>
                    {editingVehicleId === vehicle._id ? (
                      <input
                        type="text"
                        name="vehicleNumber"
                        value={updatedVehicle.vehicleNumber || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      vehicle.vehicleNumber
                    )}
                  </td>
                  <td>
                    {editingVehicleId === vehicle._id ? (
                      <input
                        type="text"
                        name="vehicleType"
                        value={updatedVehicle.vehicleType || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      vehicle.vehicleType
                    )}
                  </td>
                  <td>
                    {editingVehicleId === vehicle._id ? (
                      <input
                        type="text"
                        name="vehicleModel"
                        value={updatedVehicle.vehicleModel || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      vehicle.vehicleModel
                    )}
                  </td>
                  <td>
                    {editingVehicleId === vehicle._id ? (
                      <select
                        name="vehiclAvailability"
                        value={updatedVehicle.vehiclAvailability || ""}
                        onChange={handleInputChange}
                      >
                        <option value={true}>Available</option>
                        <option value={false}>Unavailable</option>
                      </select>
                    ) : (
                      vehicle.vehiclAvailability ? "Available" : "Unavailable"
                    )}
                  </td>
                  <td className="action-buttons">
                    {editingVehicleId === vehicle._id ? (
                      <>
                        <button
                          className="save-btn"
                          onClick={() => handleSave(vehicle._id)}
                        >
                          <i className="fas fa-save"></i> Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => {
                            setEditingVehicleId(null);
                            setUpdatedVehicle({});
                          }}
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingVehicleId(vehicle._id);
                          setUpdatedVehicle({ ...vehicle });
                        }}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                    )}
                    
                    <button 
                      className="delete-btn" 
                      onClick={() => deleteHandler(vehicle._id)}
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

export default VehicleManagement;