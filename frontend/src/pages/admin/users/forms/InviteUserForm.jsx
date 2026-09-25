import React, { useState } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { ContentCopy as CopyIcon, Check as CheckIcon } from '@mui/icons-material';
import api from '../../../../services/api';

const InviteUserForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'funeral_staff',
    department: 'Chapel Operations',
    branch: 'Eternal Rest Main Sanctuary',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdInvite, setCreatedInvite] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      const payload = {
        email: formData.email.trim(),
        role: formData.role,
        seedData: {
          department: formData.department,
          branch: formData.branch,
        },
      };

      const res = await api.post('/admin/users/invite', payload);
      setCreatedInvite(res.data.invite);
      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate invitation.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (createdInvite?.inviteLink) {
      navigator.clipboard.writeText(createdInvite.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (createdInvite) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Privileged invitation generated! The invitee can sign in via Google OAuth or direct email verification to claim their role.
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Invite Link (Valid for 72 hours):
        </Typography>

        <TextField
          fullWidth
          value={createdInvite.inviteLink}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={copyToClipboard} color={copied ? 'success' : 'primary'}>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <Button variant="contained" onClick={onCancel} sx={{ bgcolor: '#1B2A3D' }}>
          Done
        </Button>
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Send an invitation to allow the privileged user to sign up or authenticate with Google OAuth. When they sign in with their Google account matching this email, their privileged role will be assigned automatically inside an atomic database transaction.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            type="email"
            label="Invitee Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            required
            label="Privileged Role to Grant"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <MenuItem value="funeral_staff">Funeral Staff</MenuItem>
            <MenuItem value="hearse_driver">Hearse Driver</MenuItem>
            <MenuItem value="funeral_manager">Funeral Manager</MenuItem>
            <MenuItem value="admin">Administrator</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Branch / Sanctuary"
            value={formData.branch}
            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
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
          {loading ? 'Creating Invite...' : 'Generate 72h Invite Link'}
        </Button>
      </Box>
    </form>
  );
};

export default InviteUserForm;
