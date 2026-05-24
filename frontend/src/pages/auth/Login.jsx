import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  IconButton,
  Grid,
  useTheme,
  CircularProgress,
  Fade,
  Slide,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  AccountCircle,
  Spa,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const role = await login(formData.email, formData.password);

      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'staff') {
        navigate('/dashboard');
      } else if (role === 'driver') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage === 'Invalid credentials') {
        setError('Incorrect email or password');
      } else {
        setError(errorMessage || 'Login failed. Please try again.');
      }
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
        backgroundColor: '#faf9f6',
        backgroundImage: 'linear-gradient(135deg, #faf9f6 0%, #f5f5f5 100%)',
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
            background: 'linear-gradient(135deg, rgba(44, 62, 80, 0.95) 0%, rgba(139, 115, 85, 0.9) 100%), url("https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1920&q=80") center/cover no-repeat',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <Fade in={true} timeout={800}>
              <Box>
                <Spa sx={{ fontSize: 100, mb: 4, color: '#c9a961' }} />
                <Typography 
                  variant="h2" 
                  sx={{ 
                    mb: 2, 
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600,
                    letterSpacing: 1 
                  }}
                >
                  Eternal Rest
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4, 
                    fontWeight: 400,
                    letterSpacing: 0.5,
                    opacity: 0.9
                  }}
                >
                  Funeral Management System
                </Typography>
                <Typography 
                  variant="body1" 
                  align="center" 
                  sx={{ 
                    maxWidth: 450, 
                    mx: 'auto',
                    opacity: 0.85,
                    lineHeight: 1.8,
                    fontSize: '1.1rem'
                  }}
                >
                  Compassionate care for life's final journey. Sign in to access our memorial services and manage arrangements with dignity.
                </Typography>
              </Box>
            </Fade>
          </Box>
          
          {/* Decorative Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201, 169, 97, 0.1) 0%, transparent 70%)',
              zIndex: 1,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '15%',
              right: '15%',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 115, 85, 0.15) 0%, transparent 70%)',
              zIndex: 1,
            }}
          />
        </Grid>

        {/* Right side - Login Form */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            background: 'linear-gradient(135deg, #faf9f6 0%, #f5f5f5 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative background elements */}
          <Box
            sx={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201, 169, 97, 0.08) 0%, transparent 70%)',
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-30%',
              left: '-10%',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 115, 85, 0.06) 0%, transparent 70%)',
              zIndex: 0,
            }}
          />
          <Slide direction="left" in={true} timeout={600}>
            <Card
              sx={{
                maxWidth: 480,
                width: '100%',
                borderRadius: 4,
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                backgroundColor: 'white',
                border: '1px solid rgba(0,0,0,0.05)',
                position: 'relative',
                zIndex: 1,
              }}
              elevation={0}
            >
              <CardContent sx={{ p: 5 }}>
                <Typography
                  variant="h3"
                  align="center"
                  gutterBottom
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600,
                    color: '#2c3e50',
                    mb: 1,
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography
                  variant="body1"
                  align="center"
                  sx={{
                    color: '#5a6c7d',
                    mb: 4,
                  }}
                >
                  Sign in to your account
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

                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: '#e9ecef',
                          },
                          '&:hover fieldset': {
                            borderColor: '#8b7355',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8b7355',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#5a6c7d',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8b7355',
                        },
                      }}
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
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: '#e9ecef',
                          },
                          '&:hover fieldset': {
                            borderColor: '#8b7355',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8b7355',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#5a6c7d',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8b7355',
                        },
                      }}
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
                              edge="end"
                              sx={{ color: '#8b7355' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#8b7355',
                        fontSize: '0.9rem',
                      }}
                    >
                      <Link
                        to="/forgot-password"
                        style={{
                          textDecoration: 'none',
                          color: '#8b7355',
                          fontWeight: 500,
                        }}
                      >
                        Forgot Password?
                      </Link>
                    </Typography>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{
                      mt: 2,
                      py: 1.8,
                      fontSize: '1rem',
                      fontWeight: 500,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(44, 62, 80, 0.3)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In'}
                  </Button>

                  <Typography
                    align="center"
                    sx={{
                      mt: 3,
                      color: '#5a6c7d',
                      fontSize: '0.95rem',
                    }}
                  >
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      style={{
                        textDecoration: 'none',
                        color: '#8b7355',
                        fontWeight: 600,
                      }}
                    >
                      Request Access
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

export default Login;