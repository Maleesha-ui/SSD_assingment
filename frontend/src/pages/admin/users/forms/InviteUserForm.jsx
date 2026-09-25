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
  Paper,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Send as SendIcon,
  MailOutline as MailIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
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
      <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px', textAlign: 'left' }}>
          <strong>Privileged Invitation Created!</strong> The invitee can claim their privileged role by signing in via Google OAuth or clicking the secure link below.
        </Alert>

        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', mb: 1, textAlign: 'left' }}>
          One-Time Invitation Link (Valid for 72 hours):
        </Typography>

        <TextField
          fullWidth
          value={createdInvite.inviteLink}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon sx={{ color: '#64748B' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={copyToClipboard} color={copied ? 'success' : 'primary'} edge="end">
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: '10px', bgcolor: '#FFFFFF', fontFamily: 'monospace', fontSize: '0.88rem' },
          }}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={onCancel}
            sx={{
              bgcolor: '#1B2A3D',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': { bgcolor: '#2C3E50' },
            }}
          >
            Done
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, p: 2, bgcolor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A' }}>
        <Typography variant="body2" sx={{ color: '#92400E', fontSize: '0.88rem', lineHeight: 1.5 }}>
          <strong>Google OAuth Integration:</strong> Send an invitation to a verified email. When the user signs in with Google OAuth using this address, their privileged profile is atomically granted on the server side without insecure role transmission.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            type="email"
            label="Invitee Email Address"
            placeholder="colleague@domain.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailIcon sx={{ color: '#94A3B8' }} />
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
            label="Privileged Role to Grant"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            InputProps={{ sx: { borderRadius: '10px' } }}
          >
            <MenuItem value="funeral_staff">Funeral Staff (Chapel/Mortuary)</MenuItem>
            <MenuItem value="hearse_driver">Hearse Driver (Fleet/Transport)</MenuItem>
            <MenuItem value="funeral_manager">Funeral Manager (Operations Lead)</MenuItem>
            <MenuItem value="admin">Administrator (Platform Governance)</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            InputProps={{ sx: { borderRadius: '10px' } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Branch / Sanctuary"
            value={formData.branch}
            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            InputProps={{ sx: { borderRadius: '10px' } }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3.5, pt: 2, borderTop: '1px solid #E2E8F0' }}>
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
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
          sx={{
            bgcolor: '#1B2A3D',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.8,
            '&:hover': { bgcolor: '#2C3E50' },
          }}
        >
          {loading ? 'Creating Invitation...' : 'Dispatch 72h Invite Link'}
        </Button>
      </Box>
    </form>
  );
};

export default InviteUserForm;
