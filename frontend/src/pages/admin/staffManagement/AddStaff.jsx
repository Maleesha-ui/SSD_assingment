import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { TextField, Button, Box, MenuItem, Typography } from '@mui/material';

const AddStaff = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    staffDetails: {
      designation: '',
      salary: '',
    },
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('staffDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        staffDetails: { ...prev.staffDetails, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/staff/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Staff member added successfully');
        setFormData({ name: '', email: '', password: '', staffDetails: { designation: '', salary: '' } });
      } else {
        setError(data.message || 'Failed to add staff member');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      setError('An error occurred while adding the staff member');
    }
  };

  return (
    <Box sx={{ maxWidth: 500, margin: 'auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Add New Staff
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          type="email"
          required
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          type="password"
          required
        />
        <TextField
          fullWidth
          select
          label="Designation"
          name="staffDetails.designation"
          value={formData.staffDetails.designation}
          onChange={handleChange}
          margin="normal"
          required
        >
          <MenuItem value="staff">Staff</MenuItem>
          <MenuItem value="manager">Manager</MenuItem>
        </TextField>
        <TextField
          fullWidth
          label="Salary"
          name="staffDetails.salary"
          value={formData.staffDetails.salary}
          onChange={handleChange}
          margin="normal"
          type="number"
          required
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ mt: 2 }}
        >
          Add Staff
        </Button>
      </form>
    </Box>
  );
};

export default AddStaff;