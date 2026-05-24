import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DriverManagement.css";

const URL = "http://localhost:5000/drivers";

const fetchhandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function DriverManagement() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [updatedDriver, setUpdatedDriver] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    fetchhandler().then((data) => setDrivers(data.drivers));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDriver((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`http://localhost:5000/drivers/${id}`, updatedDriver);
      setEditingDriverId(null);
      fetchhandler().then((data) => setDrivers(data.drivers));
    } catch (error) {
      console.error("Error saving driver:", error);
      alert("Failed to save driver.");
    }
  };

  const deleteHandler = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/drivers/${id}`);
      fetchhandler().then((data) => setDrivers(data.drivers));
    } catch (error) {
      console.error("Error deleting driver:", error);
      alert("Failed to delete driver.");
    }
  };

  const handleSearch = () => {
    fetchhandler().then((data) => {
      const filteredDrivers = data.drivers.filter((driver) =>
        Object.values(driver).some((field) =>
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setDrivers(filteredDrivers);
      setNoResults(filteredDrivers.length === 0);
    });
  };

  return (
    <div className="driver-management-container">
      <div className="driver-management-header">
        <h1>Driver Management</h1>
        <div className="header-actions">
          <div className="search-container">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              className="search-bar"
              placeholder="Search drivers..."
            />
            <button className="search-btn" onClick={handleSearch}>
              <i className="fas fa-search"></i> Search
            </button>
          </div>
          <button 
            className="add-btn"
            onClick={() => navigate("/driverregistration")}
          >
            <i className="fas fa-plus"></i> Add Driver
          </button>
        </div>
      </div>

      {noResults ? (
        <div className="no-results">
          <p>No drivers found matching your search criteria</p>
        </div>
      ) : (
        <div className="driver-table-container">
          <table className="driver-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>License</th>
                <th>Experience</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers && drivers.map((driver, i) => (
                <tr key={i}>
                  <td>
                    {editingDriverId === driver._id ? (
                      <div className="name-inputs">
                        <input
                          type="text"
                          name="firstname"
                          value={updatedDriver.firstname || ""}
                          onChange={handleInputChange}
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          name="lastname"
                          value={updatedDriver.lastname || ""}
                          onChange={handleInputChange}
                          placeholder="Last Name"
                        />
                      </div>
                    ) : (
                      `${driver.firstname} ${driver.lastname}`
                    )}
                  </td>
                  <td>
                    {editingDriverId === driver._id ? (
                      <input
                        type="email"
                        name="email"
                        value={updatedDriver.email || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      driver.email
                    )}
                  </td>
                  <td>
                    {editingDriverId === driver._id ? (
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={updatedDriver.phoneNumber || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      driver.phoneNumber
                    )}
                  </td>
                  <td>
                    {editingDriverId === driver._id ? (
                      <input
                        type="text"
                        name="licenseNumber"
                        value={updatedDriver.licenseNumber || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      driver.licenseNumber
                    )}
                  </td>
                  <td>
                    {editingDriverId === driver._id ? (
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={updatedDriver.yearOfExperience || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      `${driver.yearOfExperience} years`
                    )}
                  </td>
                  <td className="action-buttons">
                    {editingDriverId === driver._id ? (
                      <>
                        <button
                          className="save-btn"
                          onClick={() => handleSave(driver._id)}
                        >
                          <i className="fas fa-save"></i> Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => setEditingDriverId(null)}
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditingDriverId(driver._id);
                            setUpdatedDriver({ ...driver });
                          }}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        
                        <button
                          className="delete-btn"
                          onClick={() => deleteHandler(driver._id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </>
                    )}
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

export default DriverManagement;