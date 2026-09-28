import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Alert,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Avatar,
  Fade,
  Slide,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
  DriveEta as DriverIcon,
  CheckCircle as VerifiedIcon,
  Spa,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CompleteProfile = () => {
  const { user, token, applyAuthSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'customer',
    phone: '',
    address: '',
    department: 'Operations',
    employeeId: '',
    licenseNumber: '',
  });

  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  // Extract token from URL if present and fetch initial profile
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const urlToken = params.get('token');
        const activeToken = urlToken || token || localStorage.getItem('token');

        if (!activeToken) {
          navigate('/login');
          return;
        }

        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${activeToken}` },
        });

        const profile = res.data;
        if (urlToken) {
          applyAuthSession(urlToken, profile);
        }

        // If profile is already marked complete, redirect to dashboard
        if (profile.isProfileComplete && !params.get('isNew')) {
          navigate(profile.role === 'admin' ? '/admin' : '/dashboard');
          return;
        }

        setFormData((prev) => ({
          ...prev,
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          role: profile.role && profile.role !== 'admin' && profile.role !== 'manager' ? profile.role : 'customer',
        }));
        setAvatar(profile.avatar || '');
      } catch (err) {
        console.error('Error fetching profile for completion:', err);
        setError('Failed to load profile details. Please log in again.');
      } finally {
        setInitialLoading(false);
      }
    };

    initializeProfile();
  }, [location.search, token, navigate, applyAuthSession]);

  const validate = () => {
    if (!formData.name.trim()) {
      setError('Please provide your full name');
      return false;
    }

    if (formData.phone) {
      const phoneRegex = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        setError('Phone number must be a valid 10-digit number (e.g. 0712345678 or 123-456-7890)');
        return false;
      }
    }

    if (formData.role === 'driver' && !formData.licenseNumber.trim()) {
      setError('Driver registration requires a valid license number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        role: formData.role,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      if (formData.role === 'staff') {
        payload.staffDetails = {
          department: formData.department,
          employeeId: formData.employeeId.trim(),
        };
      } else if (formData.role === 'driver') {
        payload.driverDetails = {
          licenseNumber: formData.licenseNumber.trim(),
        };
      }

      const response = await api.put('/auth/complete-profile', payload);
      const { token: updatedToken, user: updatedUser } = response.data;

      applyAuthSession(updatedToken, updatedUser);

      // Route according to finalized role
      if (updatedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Profile completion error:', err);
      setError(err.response?.data?.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick action: continue immediately with default customer role
  const handleQuickCustomer = () => {
    setFormData((prev) => ({ ...prev, role: 'customer' }));
    handleSubmit();
  };

  if (initialLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8F6F3',
        }}
      >
        <CircularProgress sx={{ color: '#C9A961' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F6F3',
        py: 6,
        px: 2,
      }}
    >
      <Slide direction="up" in={true} timeout={500}>
        <Card
          sx={{
            maxWidth: 580,
            width: '100%',
            borderRadius: 4,
            boxShadow: '0 16px 48px rgba(27, 42, 61, 0.1)',
            backgroundColor: 'white',
            border: '1px solid #E8E4DF',
            overflow: 'visible',
            position: 'relative',
          }}
          elevation={0}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {avatar ? (
                <Avatar
                  src={avatar}
                  alt={formData.name}
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    border: '3px solid #C9A961',
                    boxShadow: '0 4px 12px rgba(201, 169, 97, 0.25)',
                  }}
                />
              ) : (
                <Spa sx={{ fontSize: 50, color: '#C9A961', mb: 1 }} />
              )}

              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 600,
                  color: '#1B2A3D',
                  fontSize: { xs: '1.6rem', md: '2rem' },
                }}
              >
                Complete Your Account
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#5A6C7D',
                  fontFamily: '"Inter", sans-serif',
                  mt: 0.5,
                }}
              >
                Your Google account is connected. Please specify your account details to finish setup.
              </Typography>
            </Box>

            {error && (
              <Fade in={!!error}>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    backgroundColor: '#FFF5F5',
                    color: '#C53030',
                    borderRadius: 2,
                    border: '1px solid #FED7D7',
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                {/* Email (Readonly Google Verified) */}
                <TextField
                  fullWidth
                  label="Email Address (Verified via Google)"
                  value={formData.email}
                  disabled
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Chip
                          icon={<VerifiedIcon sx={{ color: '#2E7D32 !important' }} />}
                          label="Verified"
                          size="small"
                          sx={{
                            backgroundColor: '#E8F5E9',
                            color: '#2E7D32',
                            fontWeight: 600,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#F9F9F9',
                      borderRadius: 2,
                    },
                  }}
                />

                {/* Display Name */}
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#C9A961' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: '#C9A961' },
                      '&.Mui-focused fieldset': { borderColor: '#C9A961' },
                    },
                  }}
                />

                {/* Role Selection (Non-admin) */}
                <FormControl fullWidth required>
                  <InputLabel id="role-select-label" sx={{ '&.Mui-focused': { color: '#C9A961' } }}>
                    Account Type / Role
                  </InputLabel>
                  <Select
                    labelId="role-select-label"
                    value={formData.role}
                    label="Account Type / Role"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    sx={{
                      borderRadius: 2,
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#C9A961' },
                    }}
                  >
                    <MenuItem value="customer">Customer / Client (Memorial Arrangements)</MenuItem>
                    <MenuItem value="staff">Staff Member (Funeral Operations)</MenuItem>
                    <MenuItem value="driver">Driver / Transport Logistics</MenuItem>
                  </Select>
                </FormControl>

                {/* Conditional Fields: Staff */}
                {formData.role === 'staff' && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Department</InputLabel>
                        <Select
                          value={formData.department}
                          label="Department"
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="Operations">Operations</MenuItem>
                          <MenuItem value="Logistics">Logistics</MenuItem>
                          <MenuItem value="Customer Service">Customer Service</MenuItem>
                          <MenuItem value="Maintenance">Maintenance</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Staff ID (Optional)"
                        placeholder="Leave blank to auto-generate"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BadgeIcon sx={{ color: '#C9A961' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>
                )}

                {/* Conditional Fields: Driver */}
                {formData.role === 'driver' && (
                  <TextField
                    fullWidth
                    required
                    label="Driver's License Number"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DriverIcon sx={{ color: '#C9A961' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: '#C9A961' },
                        '&.Mui-focused fieldset': { borderColor: '#C9A961' },
                      },
                    }}
                  />
                )}

                {/* Phone Number */}
                <TextField
                  fullWidth
                  label="Contact Phone Number"
                  placeholder="e.g. 0712345678 or 123-456-7890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: '#C9A961' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: '#C9A961' },
                      '&.Mui-focused fieldset': { borderColor: '#C9A961' },
                    },
                  }}
                />

                {/* Address */}
                <TextField
                  fullWidth
                  label="Address (Optional)"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon sx={{ color: '#C9A961', alignSelf: 'flex-start', mt: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: '#C9A961' },
                      '&.Mui-focused fieldset': { borderColor: '#C9A961' },
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 1.5,
                    py: 1.6,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, #1B2A3D 0%, #243648 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #243648 0%, #1B2A3D 100%)',
                      boxShadow: '0 4px 15px rgba(27, 42, 61, 0.3)',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Complete Setup & Enter Dashboard'
                  )}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={handleQuickCustomer}
                  disabled={loading}
                  sx={{
                    color: '#5A6C7D',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': { color: '#C9A961', backgroundColor: 'transparent' },
                  }}
                >
                  Skip extra details and continue as Client
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Slide>
    </Box>
  );
};

export default CompleteProfile;
