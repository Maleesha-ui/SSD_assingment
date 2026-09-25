import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import { Security as SecurityIcon, Lock as LockIcon } from '@mui/icons-material';
import api from '../../../services/api';

/**
 * Step-Up Re-Authentication Modal
 * Invariants 2 & 8: High-privilege admin creation or elevation requires
 * the acting admin to re-enter their credentials for a fresh 5-minute step-up token.
 */
const StepUpAuthDialog = ({ open, onClose, onSuccess, title = 'Security Verification Required' }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your administrator password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/admin/users/step-up', { password });
      const { stepUpToken } = response.data;
      setPassword('');
      onSuccess(stepUpToken);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Incorrect password.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleVerify}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <SecurityIcon color="error" />
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              This is a high-privilege action. Please verify your identity with your administrator password to proceed.
            </Alert>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your re-authentication token will remain valid for 5 minutes.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Admin Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading && <CircularProgress size={18} color="inherit" />}
          >
            {loading ? 'Verifying...' : 'Authorize Action'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StepUpAuthDialog;
