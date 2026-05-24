import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./VehicleRegistration.css";

function VehicleRegistration() {
  const navigate = useNavigate();
  const [input, setInputs] = useState({
    vehicleNumber: "",
    vehicleType: "",
    vehicleModel: "",
    vehiclAvailability: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prevState) => ({
      ...prevState,
      [name]: name === "vehiclAvailability" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.vehicleNumber || !input.vehicleType || !input.vehicleModel) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      await sendRequest();
      navigate("/vehiclemanagement");
    } catch (error) {
      console.error("Error registering vehicle:", error);
      alert("Failed to register vehicle.");
    }
  };

  const sendRequest = async () => {
    await axios.post("http://localhost:5000/vehicles", {
      vehicleNumber: String(input.vehicleNumber),
      vehicleType: String(input.vehicleType),
      vehicleModel: String(input.vehicleModel),
      vehiclAvailability: Boolean(input.vehiclAvailability),
    });
  };

  return (
    <div className="vehicle-registration-wrapper">
      <div className="vehicle-registration-container">
        <header className="vehicle-registration-header">
          <h1>Register New Vehicle</h1>
          <p>Complete the form to add a vehicle to our transportation services</p>
        </header>
        <form onSubmit={handleSubmit} className="vehicle-registration-form">
          <div className="form-group">
            <label htmlFor="vehicleNumber">Vehicle Number *</label>
            <input
              type="text"
              id="vehicleNumber"
              name="vehicleNumber"
              onChange={handleChange}
              value={input.vehicleNumber}
              placeholder="e.g., AB1234"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="vehicleType">Vehicle Type *</label>
            <input
              type="text"
              id="vehicleType"
              name="vehicleType"
              onChange={handleChange}
              value={input.vehicleType}
              placeholder="e.g., Van"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="vehicleModel">Vehicle Model *</label>
            <input
              type="text"
              id="vehicleModel"
              name="vehicleModel"
              onChange={handleChange}
              value={input.vehicleModel}
              placeholder="e.g., Toyota Hiace"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="vehiclAvailability">Vehicle Availability</label>
            <select
              id="vehiclAvailability"
              name="vehiclAvailability"
              onChange={handleChange}
              value={input.vehiclAvailability}
            >
              <option value={true}>Available</option>
              <option value={false}>Unavailable</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              <i className="fas fa-plus"></i> Register Vehicle
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/vehiclemanagement")}
            >
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
        </form>
        <footer className="vehicle-registration-footer">
          <p>© 2025 Funeral Management Services</p>
        </footer>
      </div>
    </div>
  );
}

export default VehicleRegistration;