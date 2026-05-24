import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./BookingAdmin.css";
import "../components/Header.css";  // Corrected import path
import "../components/Footer.css";  // Corrected import path

const BookingAdmin = () => {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      name: "John Doe",
      package: "Standard Package",
      date: "2025-04-10",
      status: "Confirmed",
    },
    {
      id: 2,
      name: "Jane Smith",
      package: "Premium Package",
      date: "2025-04-12",
      status: "Pending",
    },
    {
      id: 3,
      name: "Michael Brown",
      package: "Basic Package",
      date: "2025-04-15",
      status: "Completed",
    },
  ]);

  const handleDelete = (id) => {
    setBookings(bookings.filter((booking) => booking.id !== id));
  };

  return (
    <div className="booking-admin-container">
      <nav className="booking-admin-navbar">
        <Link to="/bookings">Bookings</Link>
      </nav>

      <h2>Booking Management</h2>
      <table className="booking-admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer Name</th>
            <th>Package</th>
            <th>Booking Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.id}</td>
              <td>{booking.name}</td>
              <td>{booking.package}</td>
              <td>{booking.date}</td>
              <td>{booking.status}</td>
              <td>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(booking.id)}>
                  Delete
                </button>
                <button className="view-btn">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingAdmin;
