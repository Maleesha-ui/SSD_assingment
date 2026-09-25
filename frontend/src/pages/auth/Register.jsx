import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Stack,
  InputAdornment,
  IconButton,
  Grid,
  Divider,
  CircularProgress,
  Fade,
  Slide,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
  HowToReg as RegisterIcon,
  Phone,
  Home,
  Spa,
} from '@mui/icons-material';
import api from '../../services/api';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';

/**
 * Public Self-Registration Component
 * Invariant 1 & Section 5.1 / 9:
 * - Public self-registration only registers 'customer' role.
 * - NO role selector or privileged intake fields exist in this form or DOM.
 */
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please provide your full name.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    // Password strength: at least 8 characters, 1 uppercase, 1 number
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long, with 1 uppercase letter and 1 number');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Phone format check if provided
    const phoneRegex = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setError('Phone number must be in the format 123-456-7890 or 1234567890');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Invariant 1: Strictly public customer payload only. No role/userType field is sent.
      const payload = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      await api.post('/auth/register', payload);
      setSuccess('Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: '#F8F6F3',
      }}
    >
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Left side - Funeral System Branding */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 8,
            background:
              'linear-gradient(135deg, rgba(27, 42, 61, 0.92) 0%, rgba(17, 29, 43, 0.95) 100%), url("https://images.unsplash.com/photo-1507643179173-441f81b72784?w=1920&q=80") center/cover no-repeat',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <Fade in={true} timeout={800}>
              <Box>
                <Spa sx={{ fontSize: 90, mb: 3, color: '#C9A961' }} />
                <Typography
                  variant="h2"
                  sx={{
                    mb: 2,
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600,
                    letterSpacing: 1,
                    color: '#ffffff',
                  }}
                >
                  Eternal Rest
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    fontWeight: 400,
                    letterSpacing: 1,
                    color: '#C9A961',
                  }}
                >
                  Funeral Management System
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    maxWidth: 480,
                    mx: 'auto',
                    color: '#D8D4CF',
                    lineHeight: 1.8,
                    fontSize: '1.05rem',
                  }}
                >
                  Honoring lives with elegance, reverence, and unconditional dignity. Create your family account to manage memorial arrangements.
                </Typography>
              </Box>
            </Fade>
          </Box>
        </Grid>

        {/* Right side - Customer Registration Form */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2, sm: 4, md: 6 },
            backgroundColor: '#F8F6F3',
            overflowY: 'auto',
          }}
        >
          <Slide direction="up" in={true} mountOnEnter unmountOnExit>
            <Card
              sx={{
                width: '100%',
                maxWidth: 520,
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                border: '1px solid rgba(201, 169, 97, 0.2)',
                backgroundColor: '#ffffff',
                maxHeight: '92vh',
                overflowY: 'auto',
              }}
              elevation={0}
            >
              <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                <Typography
                  variant="h3"
                  align="center"
                  gutterBottom
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600,
                    color: '#1B2A3D',
                    mb: 1,
                  }}
                >
                  Create Account
                </Typography>
                <Typography
                  variant="body1"
                  align="center"
                  sx={{
                    color: '#5A6C7D',
                    mb: 4,
                  }}
                >
                  Join our compassionate family network
                </Typography>

                {error && (
                  <Fade in={!!error}>
                    <Alert
                      severity="error"
                      sx={{
                        mb: 3,
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        borderRadius: 2,
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}

                {success && (
                  <Fade in={!!success}>
                    <Alert
                      severity="success"
                      sx={{
                        mb: 3,
                        borderRadius: 2,
                      }}
                    >
                      {success}
                    </Alert>
                  </Fade>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      id="name"
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#8b7355' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      id="email"
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: '#8b7355' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      id="phone"
                      label="Phone Number (Optional)"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: '#8b7355' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      id="address"
                      label="Residential Address (Optional)"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Home sx={{ color: '#8b7355' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      id="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: '#8b7355' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              sx={{ color: '#8b7355' }}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      id="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: '#8b7355' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              sx={{ color: '#8b7355' }}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<RegisterIcon />}
                      disabled={loading}
                      sx={{
                        mt: 2,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 500,
                        borderRadius: '50px',
                        background: 'linear-gradient(135deg, #1B2A3D 0%, #243648 100%)',
                        color: '#ffffff',
                        boxShadow: '0 4px 15px rgba(27, 42, 61, 0.25)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #243648 0%, #111D2B 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(27, 42, 61, 0.35)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Create Customer Account'}
                    </Button>

                    <Box sx={{ display: 'flex', alignItems: 'center', my: 1.5 }}>
                      <Divider sx={{ flexGrow: 1, borderColor: '#E8E4DF' }} />
                      <Typography
                        variant="caption"
                        sx={{
                          px: 2,
                          color: '#8C9BA5',
                          fontWeight: 600,
                          letterSpacing: 0.5,
                        }}
                      >
                        OR CONTINUE WITH
                      </Typography>
                      <Divider sx={{ flexGrow: 1, borderColor: '#E8E4DF' }} />
                    </Box>

                    <GoogleAuthButton text="Sign up with Google" />

                    <Typography
                      variant="body2"
                      align="center"
                      sx={{
                        mt: 2,
                        color: '#5A6C7D',
                        fontSize: '0.95rem',
                      }}
                    >
                      Already have an account?{' '}
                      <Link
                        to="/login"
                        style={{
                          color: '#C9A961',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Sign in here
                      </Link>
                    </Typography>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register;