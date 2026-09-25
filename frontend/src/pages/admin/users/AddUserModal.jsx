import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Card,
  CardActionArea,
  Grid,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Badge as StaffIcon,
  DriveEta as DriverIcon,
  SupervisorAccount as ManagerIcon,
  AdminPanelSettings as AdminIcon,
  MailOutline as InviteIcon,
} from '@mui/icons-material';

import FuneralStaffForm from './forms/FuneralStaffForm';
import HearseDriverForm from './forms/HearseDriverForm';
import FuneralManagerForm from './forms/FuneralManagerForm';
import AdminForm from './forms/AdminForm';
import InviteUserForm from './forms/InviteUserForm';

const ROLE_OPTIONS = [
  {
    role: 'funeral_staff',
    title: 'Funeral Staff',
    description: 'Chapel assistants, mortuary technicians, and event coordinators.',
    icon: <StaffIcon sx={{ fontSize: 40, color: '#1B2A3D' }} />,
  },
  {
    role: 'hearse_driver',
    title: 'Hearse Driver',
    description: 'Licensed drivers for cortege, hearse, and dignified decedent transport.',
    icon: <DriverIcon sx={{ fontSize: 40, color: '#2E7D32' }} />,
  },
  {
    role: 'funeral_manager',
    title: 'Funeral Manager',
    description: 'Branch supervisors, scheduling authorities, and inventory leaders.',
    icon: <ManagerIcon sx={{ fontSize: 40, color: '#0288D1' }} />,
  },
  {
    role: 'admin',
    title: 'Administrator',
    description: 'High-privilege platform administrator (Requires MFA / Step-up re-auth).',
    icon: <AdminIcon sx={{ fontSize: 40, color: '#D32F2F' }} />,
  },
  {
    role: 'invite',
    title: 'Send Privileged Invite',
    description: '72-hour invitation link supporting seamless Google OAuth onboarding.',
    icon: <InviteIcon sx={{ fontSize: 40, color: '#C9A961' }} />,
  },
];

const AddUserModal = ({ open, onClose, onUserAdded }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleClose = () => {
    setSelectedRole(null);
    onClose();
  };

  const handleSuccess = (data) => {
    if (onUserAdded) {
      onUserAdded(data);
    }
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #eee',
          pb: 1.5,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600} color="#1B2A3D">
            {selectedRole
              ? `Provisioning ${ROLE_OPTIONS.find((r) => r.role === selectedRole)?.title}`
              : 'Provision Privileged User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {selectedRole
              ? 'Complete all required organizational details below'
              : 'Select the role to open the corresponding intake wizard'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {!selectedRole ? (
          <Grid container spacing={2}>
            {ROLE_OPTIONS.map((item) => (
              <Grid item xs={12} sm={6} key={item.role}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#1B2A3D',
                      boxShadow: '0 4px 12px rgba(27, 42, 61, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => setSelectedRole(item.role)}
                    sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Box sx={{ mb: 1.5 }}>{item.icon}</Box>
                    <Typography variant="subtitle1" fontWeight={700} color="#1B2A3D">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#0288D1',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontWeight: 500,
                  mb: 2,
                }}
                onClick={() => setSelectedRole(null)}
              >
                ← Back to role selection
              </Typography>
            </Box>

            {selectedRole === 'funeral_staff' && (
              <FuneralStaffForm onSuccess={handleSuccess} onCancel={() => setSelectedRole(null)} />
            )}
            {selectedRole === 'hearse_driver' && (
              <HearseDriverForm onSuccess={handleSuccess} onCancel={() => setSelectedRole(null)} />
            )}
            {selectedRole === 'funeral_manager' && (
              <FuneralManagerForm onSuccess={handleSuccess} onCancel={() => setSelectedRole(null)} />
            )}
            {selectedRole === 'admin' && (
              <AdminForm onSuccess={handleSuccess} onCancel={() => setSelectedRole(null)} />
            )}
            {selectedRole === 'invite' && (
              <InviteUserForm onSuccess={handleSuccess} onCancel={() => setSelectedRole(null)} />
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
