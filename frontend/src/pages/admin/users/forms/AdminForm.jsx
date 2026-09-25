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
  InputAdornment,
} from '@mui/material';
import {
  Security as SecurityIcon,
  WarningAmber as WarningIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as OfficeIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import api from '../../../../services/api';
import StepUpAuthDialog from '../StepUpAuthDialog';

const AdminForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    employeeId: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
    accessTier: 'ops_admin',
    managedBranch: 'Headquarters',
    yearsOfExperience: 5,
    emergencyContact: { name: '', relation: '', phone: '' },
    password: '',
  });

  const [stepUpOpen, setStepUpOpen] = useState(false);
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

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError('Full Name and Email are required.');
      return;
    }

    // Trigger high-privilege step-up authentication dialog
    setStepUpOpen(true);
  };

  const handleStepUpSuccess = async (stepUpToken) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        stepUpToken,
      };

      const res = await api.post('/admin/users/admin', payload, {
        headers: {
          'x-step-up-token': stepUpToken,
        },
      });

      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to provision admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleInitialSubmit}>
        {/* High-Privilege Red Banner */}
        <Alert
          severity="error"
          icon={<WarningIcon fontSize="inherit" />}
          sx={{
            mb: 3,
            bgcolor: '#FFF2F2',
            border: '1px solid #FFCDD2',
            borderRadius: '12px',
            color: '#B71C1C',
            '& .MuiAlert-icon': { color: '#D32F2F' },
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            HIGH-PRIVILEGE SECURITY CONTROL
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', mt: 0.3 }}>
            Creating an Administrator grants platform governance permissions. Step-Up authentication is strictly enforced. The provisioned administrator will be mandated to change their credentials and enroll MFA upon first sign in.
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle2" sx={{ color: '#DC2626', fontWeight: 700, mb: 1.5, letterSpacing: '0.3px' }}>
          1. Administrator Credentials & Governance Tier
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              InputProps={{ sx: { borderRadius: '10px' } }}
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
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              required
              label="Administrative Access Tier"
              value={formData.accessTier}
              onChange={(e) => handleChange('accessTier', e.target.value)}
              InputProps={{ sx: { borderRadius: '10px' } }}
            >
              <MenuItem value="super_admin">Super Administrator (Full System)</MenuItem>
              <MenuItem value="ops_admin">Operations Administrator</MenuItem>
              <MenuItem value="support_admin">Support Administrator</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5, borderColor: '#E2E8F0' }} />

        <Typography variant="subtitle2" sx={{ color: '#DC2626', fontWeight: 700, mb: 1.5, letterSpacing: '0.3px' }}>
          2. Operational Details & Credentials
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
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
              label="Assigned Office / Branch"
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
              label="Temporary Password (optional; auto-generated if blank)"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              helperText="The provisioned admin will be strictly prompted to update their password immediately upon initial authentication."
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
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SecurityIcon />}
            sx={{
              bgcolor: '#DC2626',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            {loading ? 'Authorizing & Provisioning...' : 'Authenticate & Provision Admin'}
          </Button>
        </Box>
      </form>

      <StepUpAuthDialog
        open={stepUpOpen}
        onClose={() => setStepUpOpen(false)}
        onSuccess={handleStepUpSuccess}
        title="Admin Step-Up Re-Authentication"
      />
    </>
  );
};

export default AdminForm;
