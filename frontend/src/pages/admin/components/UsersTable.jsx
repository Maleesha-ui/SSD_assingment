import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  Box,
  Button,
  TextField,
  InputAdornment,
  Typography,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  PersonAdd as AddUserIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import api from '../../../services/api';
import AddUserModal from '../users/AddUserModal';
import StepUpAuthDialog from '../users/StepUpAuthDialog';

const roleColorMap = {
  admin: { color: 'error', label: 'Admin' },
  funeral_manager: { color: 'info', label: 'Manager' },
  manager: { color: 'info', label: 'Manager' },
  hearse_driver: { color: 'success', label: 'Driver' },
  driver: { color: 'success', label: 'Driver' },
  funeral_staff: { color: 'primary', label: 'Staff' },
  staff: { color: 'primary', label: 'Staff' },
  customer: { color: 'default', label: 'Customer' },
  user: { color: 'default', label: 'Customer' },
};

const UsersTable = ({ users = [], onExportPdf, onRefresh }) => {
  const theme = useTheme();

  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);

  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleRoleChangeInitiated = (userId, newRole) => {
    // Invariant 2: If promoting to admin, require step-up authentication
    if (newRole === 'admin') {
      setPendingRoleChange({ userId, newRole });
      setStepUpOpen(true);
    } else {
      executeRoleChange(userId, newRole);
    }
  };

  const executeRoleChange = async (userId, newRole, stepUpToken = null) => {
    try {
      const headers = stepUpToken ? { 'x-step-up-token': stepUpToken } : {};
      await api.patch(`/admin/users/${userId}/role`, { role: newRole, stepUpToken }, { headers });
      showToast(`Role updated to ${newRole} successfully.`);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast(error.response?.data?.message || 'Error updating user role', 'error');
    }
  };

  const handleStepUpSuccess = (stepUpToken) => {
    if (pendingRoleChange) {
      executeRoleChange(pendingRoleChange.userId, pendingRoleChange.newRole, stepUpToken);
      setPendingRoleChange(null);
    }
  };

  const handleUserAdded = (data) => {
    showToast(data?.message || 'Privileged user successfully provisioned.');
    if (onRefresh) onRefresh();
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      searchQuery === '' ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'all' ||
      u.role === roleFilter ||
      (roleFilter === 'staff' && (u.role === 'staff' || u.role === 'funeral_staff')) ||
      (roleFilter === 'driver' && (u.role === 'driver' || u.role === 'hearse_driver')) ||
      (roleFilter === 'manager' && (u.role === 'manager' || u.role === 'funeral_manager'));

    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <Box>
      {/* Top Toolbar: Search, Filters & Action Buttons ("Add User" beside "Export PDF") */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
        }}
      >
        {/* Search & Filters */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 220 }}
          />

          <Select
            size="small"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            displayEmpty
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="customer">Customers</MenuItem>
            <MenuItem value="staff">Funeral Staff</MenuItem>
            <MenuItem value="driver">Hearse Drivers</MenuItem>
            <MenuItem value="manager">Funeral Managers</MenuItem>
            <MenuItem value="admin">Administrators</MenuItem>
          </Select>

          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending_invite">Pending Invite</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </Select>
        </Box>

        {/* Action Buttons: Add User beside Export PDF */}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddUserIcon />}
            onClick={() => setAddUserModalOpen(true)}
            sx={{
              bgcolor: '#1B2A3D',
              '&:hover': { bgcolor: '#2C3E50' },
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
            }}
          >
            Add User
          </Button>

          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={onExportPdf}
            sx={{
              bgcolor: theme.palette.error.main,
              '&:hover': { bgcolor: theme.palette.error.dark },
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
            }}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Users Data Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Provisioned By</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Join Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Change Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No users found matching current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const roleConfig = roleColorMap[user.role] || { color: 'default', label: user.role };
                return (
                  <TableRow key={user._id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={roleConfig.label}
                        color={roleConfig.color}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status || 'active'}
                        color={user.status === 'suspended' ? 'error' : user.status === 'pending_invite' ? 'warning' : 'success'}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.provisionedBy?.name || user.provisionedBy?.email || (user.authProvider === 'google' ? 'Google OAuth' : 'Self-Registered')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChangeInitiated(user._id, e.target.value)}
                        size="small"
                        sx={{ minWidth: 120, fontSize: '0.85rem' }}
                      >
                        <MenuItem value="customer">Customer</MenuItem>
                        <MenuItem value="funeral_staff">Staff</MenuItem>
                        <MenuItem value="hearse_driver">Driver</MenuItem>
                        <MenuItem value="funeral_manager">Manager</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Privileged User Intake Wizard Dialog */}
      <AddUserModal
        open={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />

      {/* Step-Up Re-Authentication Dialog for Admin Elevation */}
      <StepUpAuthDialog
        open={stepUpOpen}
        onClose={() => setStepUpOpen(false)}
        onSuccess={handleStepUpSuccess}
        title="Admin Privilege Step-Up"
      />

      {/* Feedback Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersTable;