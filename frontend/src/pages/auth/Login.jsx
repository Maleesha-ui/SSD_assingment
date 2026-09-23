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
            background: 'linear-gradient(135deg, rgba(27, 42, 61, 0.92) 0%, rgba(17, 29, 43, 0.95) 100%), url("https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1920&q=80") center/cover no-repeat',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <Fade in={true} timeout={800}>
              <Box>
                <Spa sx={{ fontSize: 80, mb: 4, color: '#C9A961' }} />
                <Typography 
                  variant="h2" 
                  sx={{ 
                    mb: 2, 
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    fontSize: { md: '2.5rem', lg: '3rem' }
                  }}
                >
                  Eternal Rest
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4, 
                    fontWeight: 300,
                    letterSpacing: 0.5,
                    opacity: 0.85,
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '1.1rem'
                  }}
                >
                  Funeral Management System
                </Typography>
                <Typography 
                  variant="body1" 
                  align="center" 
                  sx={{ 
                    maxWidth: 420, 
                    mx: 'auto',
                    opacity: 0.75,
                    lineHeight: 1.8,
                    fontSize: '1rem',
                    fontFamily: '"Inter", sans-serif'
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
              background: 'radial-gradient(circle, rgba(201, 169, 97, 0.08) 0%, transparent 70%)',
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
              background: 'radial-gradient(circle, rgba(201, 169, 97, 0.06) 0%, transparent 70%)',
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
            p: { xs: 3, md: 4 },
            background: '#F8F6F3',
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
              background: 'radial-gradient(circle, rgba(201, 169, 97, 0.06) 0%, transparent 70%)',
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
              background: 'radial-gradient(circle, rgba(27, 42, 61, 0.04) 0%, transparent 70%)',
              zIndex: 0,
            }}
          />
          <Slide direction="left" in={true} timeout={600}>
            <Card
              sx={{
                maxWidth: 480,
                width: '100%',
                borderRadius: 4,
                boxShadow: '0 16px 48px rgba(27, 42, 61, 0.1)',
                backgroundColor: 'white',
                border: '1px solid #E8E4DF',
                position: 'relative',
                zIndex: 1,
              }}
              elevation={0}
            >
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Typography
                  variant="h3"
                  align="center"
                  gutterBottom
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600,
                    color: '#1B2A3D',
                    mb: 1,
                    fontSize: { xs: '1.8rem', md: '2.2rem' }
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography
                  variant="body1"
                  align="center"
                  sx={{
                    color: '#5A6C7D',
                    mb: 4,
                    fontSize: '0.95rem'
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
                        backgroundColor: '#FFF5F5',
                        color: '#C53030',
                        borderRadius: 2,
                        border: '1px solid #FED7D7'
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
                          '& fieldset': { borderColor: '#E8E4DF' },
                          '&:hover fieldset': { borderColor: '#C9A961' },
                          '&.Mui-focused fieldset': { borderColor: '#C9A961', borderWidth: 2 },
                        },
                        '& .MuiInputLabel-root': { color: '#5A6C7D' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#C9A961' },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: '#C9A961' }} />
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
                          '& fieldset': { borderColor: '#E8E4DF' },
                          '&:hover fieldset': { borderColor: '#C9A961' },
                          '&.Mui-focused fieldset': { borderColor: '#C9A961', borderWidth: 2 },
                        },
                        '& .MuiInputLabel-root': { color: '#5A6C7D' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#C9A961' },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: '#C9A961' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: '#5A6C7D' }}
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
                        color: '#C9A961',
                        fontSize: '0.9rem',
                      }}
                    >
                      <Link
                        to="/forgot-password"
                        style={{
                          textDecoration: 'none',
                          color: '#C9A961',
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
                      fontWeight: 600,
                      borderRadius: '50px',
                      background: 'linear-gradient(135deg, #1B2A3D 0%, #243648 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #243648 0%, #1B2A3D 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(27, 42, 61, 0.3)',
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
                      color: '#5A6C7D',
                      fontSize: '0.95rem',
                    }}
                  >
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      style={{
                        textDecoration: 'none',
                        color: '#C9A961',
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