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
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Badge as StaffIcon,
  DriveEta as DriverIcon,
  SupervisorAccount as ManagerIcon,
  AdminPanelSettings as AdminIcon,
  MailOutline as InviteIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

import FuneralStaffForm from './forms/FuneralStaffForm';
import HearseDriverForm from './forms/HearseDriverForm';
import FuneralManagerForm from './forms/FuneralManagerForm';
import AdminForm from './forms/AdminForm';
import InviteUserForm from './forms/InviteUserForm';

const ROLE_OPTIONS = [
  {
    role: 'admin',
    title: 'Administrator',
    tag: 'Tier 1 • High Privilege',
    tagColor: { bg: '#FEF2F2', text: '#B91C1C', border: '#FCA5A5' },
    accentColor: '#DC2626',
    description: 'Executive platform administrator with system-wide governance authority.',
    highlights: ['Requires Step-Up MFA Re-auth', 'Full Security & Audit Governance', 'User & Privilege Delegation'],
    icon: <AdminIcon sx={{ fontSize: 30, color: '#DC2626' }} />,
    iconBg: '#FEF2F2',
  },
  {
    role: 'funeral_manager',
    title: 'Funeral Manager',
    tag: 'Tier 2 • Operations Lead',
    tagColor: { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
    accentColor: '#0288D1',
    description: 'Branch supervisor managing funeral operations, approvals, and inventory.',
    highlights: ['Leave & Task Approvals', 'Inventory & Stock Governance', 'Driver & Staff Scheduling'],
    icon: <ManagerIcon sx={{ fontSize: 30, color: '#0288D1' }} />,
    iconBg: '#E0F2FE',
  },
  {
    role: 'hearse_driver',
    title: 'Hearse Driver',
    tag: 'Tier 3 • Fleet & Logistics',
    tagColor: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
    accentColor: '#10B981',
    description: 'Licensed commercial cortege and decedent transportation driver.',
    highlights: ['Hearse Fleet Management', 'Route Mapping & Cortege Navigation', 'Medical & License Tracking'],
    icon: <DriverIcon sx={{ fontSize: 30, color: '#10B981' }} />,
    iconBg: '#ECFDF5',
  },
  {
    role: 'funeral_staff',
    title: 'Funeral Staff',
    tag: 'Tier 3 • Operations Staff',
    tagColor: { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
    accentColor: '#6366F1',
    description: 'Chapel assistants, mortuary technicians, and event coordinators.',
    highlights: ['Chapel & Sanctuary Duties', 'Service Arrangement & Setup', 'Attendance & Task Execution'],
    icon: <StaffIcon sx={{ fontSize: 30, color: '#6366F1' }} />,
    iconBg: '#EEF2FF',
  },
  {
    role: 'invite',
    title: 'Send Privileged Invite',
    tag: 'Google OAuth • 72h Token',
    tagColor: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
    accentColor: '#D97706',
    description: 'Dispatch a secure 72-hour invitation link supporting seamless Google sign-in.',
    highlights: ['Self-Onboarding via Google OAuth', 'Role Pre-Assigned on Claim', 'No Plaintext Password Exchange'],
    icon: <InviteIcon sx={{ fontSize: 30, color: '#D97706' }} />,
    iconBg: '#FEF3C7',
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

  const activeRoleConfig = ROLE_OPTIONS.find((r) => r.role === selectedRole);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
        },
      }}
    >
      {/* ==================== MODAL HEADER ==================== */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 2.5, sm: 3.5 },
          py: 2.2,
          bgcolor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: selectedRole && activeRoleConfig ? activeRoleConfig.iconBg : '#1B2A3D',
              color: selectedRole && activeRoleConfig ? activeRoleConfig.accentColor : '#C9A961',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              border: `1px solid ${selectedRole && activeRoleConfig ? activeRoleConfig.tagColor.border : 'rgba(201, 169, 97, 0.4)'}`,
            }}
          >
            {selectedRole && activeRoleConfig ? activeRoleConfig.icon : <ShieldIcon sx={{ fontSize: 24 }} />}
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ fontSize: '1.2rem', lineHeight: 1.2 }}>
                {selectedRole && activeRoleConfig
                  ? `Provision ${activeRoleConfig.title}`
                  : 'Provision Privileged User'}
              </Typography>
              <Chip
                label={selectedRole ? 'STEP 2 / 2' : 'STEP 1 / 2'}
                size="small"
                sx={{
                  bgcolor: '#E2E8F0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  height: 20,
                  borderRadius: '6px',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.3 }}>
              {selectedRole
                ? 'Complete mandatory identity verification and profile credentials below'
                : 'Select an organizational role archetype to launch the security provisioning wizard'}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            width: 34,
            height: 34,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ==================== MODAL CONTENT ==================== */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: '#FFFFFF' }}>
        {!selectedRole ? (
          <Box>
            {/* Role Cards Grid */}
            <Grid container spacing={2.5}>
              {ROLE_OPTIONS.map((item) => (
                <Grid item xs={12} sm={6} key={item.role}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      bgcolor: '#FFFFFF',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      '&:hover': {
                        borderColor: item.accentColor,
                        boxShadow: `0 12px 24px -4px ${item.tagColor.border}`,
                        transform: 'translateY(-3px)',
                        '& .arrow-icon': {
                          transform: 'translateX(4px)',
                          color: item.accentColor,
                        },
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => setSelectedRole(item.role)}
                      sx={{
                        p: 2.5,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        {/* Top: Icon + Clearance Tag */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.8 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '12px',
                              bgcolor: item.iconBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {item.icon}
                          </Box>

                          <Chip
                            label={item.tag}
                            size="small"
                            sx={{
                              bgcolor: item.tagColor.bg,
                              color: item.tagColor.text,
                              border: `1px solid ${item.tagColor.border}`,
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              height: 24,
                              borderRadius: '8px',
                            }}
                          />
                        </Box>

                        {/* Title & Description */}
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{ color: '#0F172A', fontSize: '1.05rem', mb: 0.8 }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5, mb: 2 }}
                        >
                          {item.description}
                        </Typography>

                        {/* Highlights list */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, mb: 1.5 }}>
                          {item.highlights.map((highlight, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircleIcon sx={{ fontSize: 14, color: item.accentColor }} />
                              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.78rem' }}>
                                {highlight}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>

                      {/* Footer: Action prompt */}
                      <Box
                        sx={{
                          width: '100%',
                          pt: 1.5,
                          mt: 1,
                          borderTop: '1px dashed #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600, color: item.accentColor, fontSize: '0.8rem' }}>
                          Launch Intake Wizard
                        </Typography>
                        <ArrowForwardIcon
                          className="arrow-icon"
                          sx={{ fontSize: 16, color: '#94A3B8', transition: 'all 0.2s ease' }}
                        />
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Security Guarantee Notice */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: '12px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <LockIcon sx={{ fontSize: 20, color: '#64748B' }} />
              <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.4 }}>
                <strong>Security Policy:</strong> All privileged provisioning actions are cryptographically signed, timestamped, and immutably recorded in the system audit logs. Administrator additions require step-up authentication.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            {/* Step 2 Form Navigation Bar */}
            <Box
              sx={{
                mb: 3,
                p: 1.5,
                borderRadius: '12px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() => setSelectedRole(null)}
                sx={{
                  color: '#475569',
                  borderColor: '#CBD5E1',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  bgcolor: '#FFFFFF',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                }}
              >
                Back to Role Selection
              </Button>

              {activeRoleConfig && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={activeRoleConfig.icon}
                    label={activeRoleConfig.title}
                    sx={{
                      bgcolor: activeRoleConfig.tagColor.bg,
                      color: activeRoleConfig.tagColor.text,
                      border: `1px solid ${activeRoleConfig.tagColor.border}`,
                      fontWeight: 700,
                      borderRadius: '8px',
                      '& .MuiChip-icon': { color: activeRoleConfig.accentColor },
                    }}
                  />
                  <Chip
                    label={activeRoleConfig.tag}
                    size="small"
                    sx={{
                      bgcolor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#475569',
                      fontWeight: 600,
                      fontSize: '0.72rem',
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Active Form Component */}
            <Box sx={{ pt: 1 }}>
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
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
