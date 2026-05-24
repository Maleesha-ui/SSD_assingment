import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DriverRegistration.css";

function DriverRegistration() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    firstname: "",
    lastname: "",
    email: "",
    licenseNumber: "",
    phoneNumber: "",
    yearOfExperience: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !inputs.firstname ||
      !inputs.lastname ||
      !inputs.email ||
      !inputs.licenseNumber ||
      !inputs.phoneNumber ||
      !inputs.yearOfExperience
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      await sendRequest();
      navigate("/drivermanagement");
    } catch (error) {
      console.error("Error registering driver:", error);
      alert("Failed to register driver.");
    }
  };

  const sendRequest = async () => {
    await axios.post("http://localhost:5000/drivers", {
      firstname: String(inputs.firstname),
      lastname: String(inputs.lastname),
      email: String(inputs.email),
      licenseNumber: String(inputs.licenseNumber),
      phoneNumber: String(inputs.phoneNumber),
      yearOfExperience: Number(inputs.yearOfExperience),
    });
  };

  return (
    <div className="driver-registration-wrapper">
      <div className="driver-registration-container">
        <header className="driver-registration-header">
          <h1>Register New Driver</h1>
          <p>Complete the form to add a driver to our transportation services</p>
        </header>
        <form onSubmit={handleSubmit} className="driver-registration-form">
          <div className="form-group">
            <label htmlFor="firstname">First Name *</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              onChange={handleChange}
              value={inputs.firstname}
              placeholder="e.g., John"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastname">Last Name *</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              onChange={handleChange}
              value={inputs.lastname}
              placeholder="e.g., Doe"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={handleChange}
              value={inputs.email}
              placeholder="e.g., john.doe@gmail.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="licenseNumber">License Number *</label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              onChange={handleChange}
              value={inputs.licenseNumber}
              placeholder="e.g., A12345678"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number *</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              onChange={handleChange}
              value={inputs.phoneNumber}
              placeholder="e.g., 0701234567"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="yearOfExperience">Years of Experience *</label>
            <input
              type="number"
              id="yearOfExperience"
              name="yearOfExperience"
              onChange={handleChange}
              value={inputs.yearOfExperience}
              placeholder="e.g., 4"
              min="0"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              <i className="fas fa-plus"></i> Register Driver
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/drivermanagement")}
            >
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
        </form>
        <footer className="driver-registration-footer">
          <p>© 2025 Funeral Management Services</p>
        </footer>
      </div>
    </div>
  );
}

export default DriverRegistration;