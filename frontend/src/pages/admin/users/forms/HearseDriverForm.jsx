import React, { useState } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import api from '../../../../services/api';

const HearseDriverForm = ({ onSuccess, onCancel }) => {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 2);
  const defaultFutureStr = futureDate.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    employeeId: `DRV-${Math.floor(1000 + Math.random() * 9000)}`,
    licenseNumber: `DL-${Math.floor(100000 + Math.random() * 900000)}`,
    licenseClass: 'Heavy Commercial Vehicle (Hearse Certified)',
    licenseExpiry: defaultFutureStr,
    medicalCertificateExpiry: defaultFutureStr,
    backgroundCheckDate: new Date().toISOString().split('T')[0],
    assignedVehicleId: '',
    availabilitySchedule: 'On-Call 24/7 Service',
    emergencyContact: { name: '', relation: '', phone: '' },
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Invariant 8 & 9 (Section 13 Criteria 8 & 9):
    if (new Date(formData.licenseExpiry) <= new Date()) {
      setError('Driver license expiry date must be in the future.');
      return;
    }
    if (new Date(formData.medicalCertificateExpiry) <= new Date()) {
      setError('Medical certificate expiry date must be in the future.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/admin/users/hearse-driver', formData);
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to provision hearse driver.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="subtitle2" color="primary" fontWeight={600} gutterBottom>
        1. Driver Identity & Contact
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Date of Birth"
            InputLabelProps={{ shrink: true }}
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" color="primary" fontWeight={600} gutterBottom>
        2. Driver Licensing & Certifications (Strict Future Expiry Validation)
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="Employee ID"
            value={formData.employeeId}
            onChange={(e) => handleChange('employeeId', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="License Number"
            value={formData.licenseNumber}
            onChange={(e) => handleChange('licenseNumber', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="License Class"
            value={formData.licenseClass}
            onChange={(e) => handleChange('licenseClass', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            type="date"
            label="License Expiry (Future Date)"
            InputLabelProps={{ shrink: true }}
            value={formData.licenseExpiry}
            onChange={(e) => handleChange('licenseExpiry', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            type="date"
            label="Medical Certificate Expiry"
            InputLabelProps={{ shrink: true }}
            value={formData.medicalCertificateExpiry}
            onChange={(e) => handleChange('medicalCertificateExpiry', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            type="date"
            label="Background Check Date"
            InputLabelProps={{ shrink: true }}
            value={formData.backgroundCheckDate}
            onChange={(e) => handleChange('backgroundCheckDate', e.target.value)}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" color="primary" fontWeight={600} gutterBottom>
        3. Vehicle Assignment & Emergency Contact
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Assigned Hearse / Vehicle (Optional)"
            placeholder="e.g. Cadillac Hearse #01"
            value={formData.assignedVehicleId}
            onChange={(e) => handleChange('assignedVehicleId', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Availability Schedule"
            value={formData.availabilitySchedule}
            onChange={(e) => handleChange('availabilitySchedule', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Emergency Contact Name"
            value={formData.emergencyContact.name}
            onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Relationship"
            value={formData.emergencyContact.relation}
            onChange={(e) => handleNestedChange('emergencyContact', 'relation', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Emergency Phone"
            value={formData.emergencyContact.phone}
            onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button onClick={onCancel} disabled={loading} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: '#1B2A3D', '&:hover': { bgcolor: '#2C3E50' } }}
          startIcon={loading && <CircularProgress size={18} color="inherit" />}
        >
          {loading ? 'Provisioning...' : 'Provision Hearse Driver'}
        </Button>
      </Box>
    </form>
  );
};

export default HearseDriverForm;
