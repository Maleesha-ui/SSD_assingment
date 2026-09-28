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
  IconButton,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  Close as CloseIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import api from '../../../services/api';

/**
 * Step-Up Re-Authentication Modal
 * Invariants 2 & 8: High-privilege admin creation or elevation requires
 * the acting admin to re-enter their credentials for a fresh 5-minute step-up token.
 */
const StepUpAuthDialog = ({ open, onClose, onSuccess, title = 'Step-Up Security Verification' }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your administrator password to authorize this action.');
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
      setError(err.response?.data?.message || 'Verification failed. Incorrect administrator password.');
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
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '18px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
        },
      }}
    >
      <form onSubmit={handleVerify}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            bgcolor: '#FEF2F2',
            borderBottom: '1px solid #FEE2E2',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                bgcolor: '#FFFFFF',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.15)',
              }}
            >
              <SecurityIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#991B1B', fontSize: '1.05rem', lineHeight: 1.2 }}>
                {title}
              </Typography>
              <Typography variant="caption" sx={{ color: '#B91C1C' }}>
                High-Privilege Re-Authentication
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: '#991B1B' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Alert
              severity="warning"
              icon={<KeyIcon />}
              sx={{
                mb: 2,
                borderRadius: '10px',
                bgcolor: '#FFFBEB',
                color: '#92400E',
                border: '1px solid #FDE68A',
                '& .MuiAlert-icon': { color: '#D97706' },
              }}
            >
              This action requires step-up credential verification. Your authorization token will be valid for <strong>5 minutes</strong>.
            </Alert>

            {error && (
              <Alert
                severity="error"
                onClose={() => setError('')}
                sx={{ mb: 2, borderRadius: '10px' }}
              >
                {error}
              </Alert>
            )}

            <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '0.88rem' }}>
              Confirm your active administrator credentials to proceed with high-tier provisioning or privilege elevation:
            </Typography>

            <TextField
              autoFocus
              fullWidth
              label="Administrator Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: '#94A3B8' }} />,
                sx: { borderRadius: '10px' },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            sx={{
              color: '#475569',
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
            startIcon={loading && <CircularProgress size={18} color="inherit" />}
            sx={{
              bgcolor: '#DC2626',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            {loading ? 'Verifying...' : 'Authorize Action'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StepUpAuthDialog;
