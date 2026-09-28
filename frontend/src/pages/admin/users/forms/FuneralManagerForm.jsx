import React, { useState, useEffect } from 'react';
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
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Business as OfficeIcon,
  SupervisorAccount as SupervisorIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import api from '../../../../services/api';

const FuneralManagerForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    employeeId: `MGR-${Math.floor(1000 + Math.random() * 9000)}`,
    managedBranch: 'Eternal Rest Main Sanctuary & Branch',
    reportingTo: '',
    hireDate: new Date().toISOString().split('T')[0],
    yearsOfExperience: 3,
    managementCertifications: [{ name: 'Certified Funeral Service Practitioner (CFSP)', expiry: '' }],
    emergencyContact: { name: '', relation: '', phone: '' },
    password: '',
  });

  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const res = await api.get('/admin/users');
        const eligible = res.data.filter(
          (u) => u.role === 'admin' || u.role === 'funeral_manager' || u.role === 'manager'
        );
        setSupervisors(eligible);
        if (eligible.length > 0) {
          setFormData((prev) => ({ ...prev, reportingTo: eligible[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load eligible reporting managers:', err);
      }
    };
    fetchSupervisors();
  }, []);

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

    if (Number(formData.yearsOfExperience) < 0) {
      setError('Years of experience must be 0 or higher.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/admin/users/funeral-manager', formData);
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to provision funeral manager.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Typography variant="subtitle2" sx={{ color: '#0288D1', fontWeight: 700, mb: 1.5, letterSpacing: '0.3px' }}>
        1. Manager Information & Branch Leadership
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px' },
            }}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px' },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px' },
            }}
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
            InputProps={{ sx: { borderRadius: '10px' } }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2.5, borderColor: '#E2E8F0' }} />

      <Typography variant="subtitle2" sx={{ color: '#0288D1', fontWeight: 700, mb: 1.5, letterSpacing: '0.3px' }}>
        2. Governance & Operational Hierarchy
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="Employee ID"
            value={formData.employeeId}
            onChange={(e) => handleChange('employeeId', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px' },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="Managed Branch"
            value={formData.managedBranch}
            onChange={(e) => handleChange('managedBranch', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <OfficeIcon sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px' },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            required
            label="Reporting To (Supervisor)"
            value={formData.reportingTo}
            onChange={(e) => handleChange('reportingTo', e.target.value)}
            helperText="Must report to an active admin or manager"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SupervisorIcon sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px' },
            }}
          >
            {supervisors.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name} ({s.role})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            type="number"
            label="Years of Experience"
            inputProps={{ min: 0 }}
            value={formData.yearsOfExperience}
            onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
            InputProps={{ sx: { borderRadius: '10px' } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            type="date"
            label="Hire Date"
            InputLabelProps={{ shrink: true }}
            value={formData.hireDate}
            onChange={(e) => handleChange('hireDate', e.target.value)}
            InputProps={{ sx: { borderRadius: '10px' } }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2.5, borderColor: '#E2E8F0' }} />

      <Typography variant="subtitle2" sx={{ color: '#0288D1', fontWeight: 700, mb: 1.5, letterSpacing: '0.3px' }}>
        3. Emergency Contact & Initial Password
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Emergency Contact Name"
            value={formData.emergencyContact.name}
            onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
            InputProps={{ sx: { borderRadius: '10px' } }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Relationship"
            value={formData.emergencyContact.relation}
            onChange={(e) => handleNestedChange('emergencyContact', 'relation', e.target.value)}
            InputProps={{ sx: { borderRadius: '10px' } }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Emergency Phone"
            value={formData.emergencyContact.phone}
            onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
            InputProps={{ sx: { borderRadius: '10px' } }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="password"
            label="Initial Password (leave blank to auto-generate)"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px' },
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3, pt: 2, borderTop: '1px solid #E2E8F0' }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          sx={{
            color: '#64748B',
            borderColor: '#CBD5E1',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { bgcolor: '#F8FAFC' },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={18} color="inherit" />}
          sx={{
            bgcolor: '#1B2A3D',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.8,
            '&:hover': { bgcolor: '#2C3E50' },
          }}
        >
          {loading ? 'Provisioning...' : 'Provision Funeral Manager'}
        </Button>
      </Box>
    </form>
  );
};

export default FuneralManagerForm;
