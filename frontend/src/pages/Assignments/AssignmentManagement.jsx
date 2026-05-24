import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AssignmentManagement.css";

const AssignmentManagement = () => {
  const [assignments, setAssignments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({
    bookingId: "",
    vehicleId: "",
    driverId: "",
    assignedDate: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/assignments");
      setAssignments(res.data.assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/vehicles");
      setVehicles(res.data.vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/drivers");
      setDrivers(res.data.drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAssignments(), fetchVehicles(), fetchDrivers()]);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (editingId) {
        await axios.put(`http://localhost:5000/assignments/${editingId}`, form);
      } else {
        await axios.post("http://localhost:5000/assignments", form);
      }
      setForm({ bookingId: "", vehicleId: "", driverId: "", assignedDate: "" });
      setEditingId(null);
      await fetchAssignments();
    } catch (error) {
      console.error("Error saving assignment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingId(assignment._id);
    setForm({
      bookingId: assignment.bookingId,
      vehicleId: assignment.vehicleId._id,
      driverId: assignment.driverId._id,
      assignedDate: assignment.assignedDate.slice(0, 10),
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        setIsLoading(true);
        await axios.delete(`http://localhost:5000/assignments/${id}`);
        await fetchAssignments();
      } catch (error) {
        console.error("Error deleting assignment:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendDetails = (driverPhoneNumber, bookingId, assignedDate) => {
    const phone = driverPhoneNumber.startsWith("+") 
      ? driverPhoneNumber.slice(1) 
      : driverPhoneNumber;
  
    const message = `🚐 *New Transport Assignment*\n\nBooking ID: ${bookingId}\nAssigned Date: ${assignedDate}\n\nPlease confirm receipt of this assignment.`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="assignment-container">
      <div className="assignment-header">
        <h2>Transport Assignment Management</h2>
        <p>Manage vehicle and driver assignments for transport bookings</p>
      </div>

      <div className="assignment-card">
        <h3>{editingId ? "Edit Assignment" : "Create New Assignment"}</h3>
        <form onSubmit={handleSubmit} className="assignment-form">
          <div className="form-group">
            <label htmlFor="bookingId">Booking ID</label>
            <input
              type="text"
              id="bookingId"
              name="bookingId"
              placeholder="Enter booking ID"
              value={form.bookingId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="vehicleId">Vehicle</label>
            <select 
              id="vehicleId" 
              name="vehicleId" 
              value={form.vehicleId} 
              onChange={handleChange} 
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.vehicleNumber} ({v.vehicleType})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="driverId">Driver</label>
            <select 
              id="driverId" 
              name="driverId" 
              value={form.driverId} 
              onChange={handleChange} 
              required
            >
              <option value="">Select Driver</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.firstname} {d.lastname} ({d.licenseNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assignedDate">Assigned Date</label>
            <input
              type="date"
              id="assignedDate"
              name="assignedDate"
              value={form.assignedDate}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Processing..." : (editingId ? "Update Assignment" : "Create Assignment")}
          </button>
          {editingId && (
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => {
                setEditingId(null);
                setForm({ bookingId: "", vehicleId: "", driverId: "", assignedDate: "" });
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="assignment-list">
        <h3>Current Assignments</h3>
        {isLoading ? (
          <div className="loading-spinner">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <p className="no-assignments">No assignments found. Create one above.</p>
        ) : (
          <div className="table-responsive">
            <table className="assignment-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Assigned Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a._id}>
                    <td>{a.bookingId}</td>
                    <td>
                      {a.vehicleId?.vehicleNumber} 
                      {a.vehicleId?.vehicleType && <span className="vehicle-type">({a.vehicleId.vehicleType})</span>}
                    </td>
                    <td>
                      {a.driverId?.firstname} {a.driverId?.lastname}
                      {a.driverId?.phoneNumber && <div className="driver-phone">{a.driverId.phoneNumber}</div>}
                    </td>
                    <td>{new Date(a.assignedDate).toLocaleDateString()}</td>
                    <td className="actions">
                      <button 
                        onClick={() => handleEdit(a)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(a._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() =>
                          handleSendDetails(
                            a.driverId?.phoneNumber,
                            a.bookingId,
                            new Date(a.assignedDate).toLocaleDateString()
                          )
                        }
                        className="notify-btn"
                      >
                        <i className="icon-whatsapp"></i> Notify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentManagement;