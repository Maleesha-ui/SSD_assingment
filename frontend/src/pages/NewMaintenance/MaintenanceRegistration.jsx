import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MaintenanceRegistration.css";

function MaintenanceRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicle_id: "",
    service_type: "",
    service_date: "",
    cost: "",
    next_service_date: "",
  });
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/vehicles").then((res) => setVehicles(res.data.vehicles));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/maintenance", formData);
      setSuccess("Maintenance record added successfully!");
      setError("");
      setFormData({
        vehicle_id: "",
        service_type: "",
        service_date: "",
        cost: "",
        next_service_date: "",
      });
      navigate("/maintenancereport"); // Navigate to report
    } catch (err) {
      console.error(err);
      setError("Failed to add maintenance record.");
      setSuccess("");
    }
  };

  return (
    <div className="maintenance-registration-container">
      <h1>Add Maintenance Record</h1>
      <form onSubmit={handleSubmit} className="maintenance-form">
        <div className="form-group">
          <label htmlFor="vehicle_id">Vehicle</label>
          <select
            id="vehicle_id"
            name="vehicle_id"
            value={formData.vehicle_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.vehicleModel} ({vehicle.vehicleNumber})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="service_type">Service Type</label>
          <input
            type="text"
            id="service_type"
            name="service_type"
            value={formData.service_type}
            onChange={handleInputChange}
            placeholder="e.g., Oil Change"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="service_date">Service Date</label>
          <input
            type="date"
            id="service_date"
            name="service_date"
            value={formData.service_date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cost">Cost ($)</label>
          <input
            type="number"
            id="cost"
            name="cost"
            value={formData.cost}
            onChange={handleInputChange}
            placeholder="e.g., 100"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="next_service_date">Next Service Date</label>
          <input
            type="date"
            id="next_service_date"
            name="next_service_date"
            value={formData.next_service_date}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          <i className="fas fa-save"></i> Add Record
        </button>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </form>
    </div>
  );
}

export default MaintenanceRegistration;