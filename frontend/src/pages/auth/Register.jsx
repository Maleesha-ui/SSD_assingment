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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Badge as RoleIcon,
  Phone,
  Home,
  DriveEta,
  Work,
  Spa,
} from '@mui/icons-material';
import api from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'customer',
    phone: '',
    address: '',
    driverDetails: {
      licenseNumber: '',
      vehicleType: '',
      availability: 'available',
    },
    staffDetails: {
      employeeId: '',
      department: '',
      availability: 'available',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const departments = ['Operations', 'Logistics', 'Customer Service', 'Maintenance'];

  const validateForm = () => {
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
    // Phone number validation: simple format check (e.g., 123-456-7890 or 1234567890)
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

    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        phone: formData.phone,
        address: formData.address,
      };

      if (formData.userType === 'driver') {
        userData.driverDetails = formData.driverDetails;
      }

     if (formData.userType === 'staff' || formData.userType === 'manager' || formData.userType === 'admin') {
      userData.staffDetails = formData.staffDetails;
    }

      await api.post('/auth/register', userData);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
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
            background: 'linear-gradient(135deg, rgba(44, 62, 80, 0.95) 0%, rgba(139, 115, 85, 0.9) 100%), url("https://images.unsplash.com/photo-1507643179173-441f81b72784?w=1920&q=80") center/cover no-repeat',
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
                  Join our compassionate network to help families during their time of need with dignity and care.
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

        {/* Right side - Registration Form */}
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
                maxWidth: 520,
                width: '100%',
                borderRadius: 4,
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                backgroundColor: 'white',
                border: '1px solid rgba(0,0,0,0.05)',
                overflowY: 'auto',
                maxHeight: '90vh',
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
                Create Account
              </Typography>
              <Typography
                variant="body1"
                align="center"
                sx={{
                  color: '#5a6c7d',
                  mb: 4,
                }}
              >
                Join our compassionate network
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
                <Stack spacing={2.5}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#5a6c7d' }}>Account Type</InputLabel>
                    <Select
                      value={formData.userType}
                      onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                      required
                      sx={{
                        borderRadius: 2,
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
                      startAdornment={
                        <InputAdornment position="start" sx={{ ml: 1 }}>
                          <RoleIcon sx={{ color: '#8b7355' }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="customer">Family Member</MenuItem>
                      <MenuItem value="staff">Funeral Staff</MenuItem>
                      <MenuItem value="driver">Hearse Driver</MenuItem>
                      <MenuItem value="manager">Funeral Manager</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>

                  <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />

                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                          <PersonIcon sx={{ color: '#8b7355' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

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
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                          <Phone sx={{ color: '#8b7355' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                          <Home sx={{ color: '#8b7355' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {formData.userType === 'driver' && (
                    <>
                      <Divider sx={{ my: 2, borderColor: '#e9ecef' }} />
                      <Typography variant="subtitle1" sx={{ color: '#616161' }}>
                        Hearse Driver Information
                      </Typography>
                      <TextField
                        fullWidth
                        label="Driver License Number"
                        value={formData.driverDetails.licenseNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            driverDetails: {
                              ...formData.driverDetails,
                              licenseNumber: e.target.value,
                            },
                          })
                        }
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#e0e0e0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#bdbdbd',
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DriveEta sx={{ color: '#757575' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Vehicle Type"
                        value={formData.driverDetails.vehicleType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            driverDetails: {
                              ...formData.driverDetails,
                              vehicleType: e.target.value,
                            },
                          })
                        }
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#e0e0e0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#bdbdbd',
                            },
                          },
                        }}
                      />
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#757575' }}>Availability</InputLabel>
                        <Select
                          value={formData.driverDetails.availability}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              driverDetails: {
                                ...formData.driverDetails,
                                availability: e.target.value,
                              },
                            })
                          }
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                              },
                              '&:hover fieldset': {
                                borderColor: '#bdbdbd',
                              },
                            },
                          }}
                        >
                          <MenuItem value="available">Available</MenuItem>
                          <MenuItem value="unavailable">Unavailable</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {formData.userType === 'staff' || formData.userType === 'manager' && (
                    <>
                      <Divider sx={{ my: 2, borderColor: '#e9ecef' }} />
                      <Typography variant="subtitle1" sx={{ color: '#616161' }}>
                        Staff Information
                      </Typography>
                      <TextField
                        fullWidth
                        label="Employee ID"
                        value={formData.staffDetails.employeeId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            staffDetails: {
                              ...formData.staffDetails,
                              employeeId: e.target.value,
                            },
                          })
                        }
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#e0e0e0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#bdbdbd',
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Work sx={{ color: '#757575' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#757575' }}>Department</InputLabel>
                        <Select
                          value={formData.staffDetails.department}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              staffDetails: {
                                ...formData.staffDetails,
                                department: e.target.value,
                              },
                            })
                          }
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                              },
                              '&:hover fieldset': {
                                borderColor: '#bdbdbd',
                              },
                            },
                          }}
                        >
                          {departments.map((dept) => (
                            <MenuItem key={dept} value={dept}>
                              {dept}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#757575' }}>Availability</InputLabel>
                        <Select
                          value={formData.staffDetails.availability}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              staffDetails: {
                                ...formData.staffDetails,
                                availability: e.target.value,
                              },
                            })
                          }
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                              },
                              '&:hover fieldset': {
                                borderColor: '#bdbdbd',
                              },
                            },
                          }}
                        >
                          <MenuItem value="available">Available</MenuItem>
                          <MenuItem value="unavailable">Unavailable</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {formData.userType === 'manager' && (
                    <>
                      <Divider sx={{ my: 2, borderColor: '#e9ecef' }} />
                      <Typography variant="subtitle1" sx={{ color: '#616161' }}>
                        Staff Information
                      </Typography>
                      <TextField
                        fullWidth
                        label="Employee ID"
                        value={formData.staffDetails.employeeId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            staffDetails: {
                              ...formData.staffDetails,
                              employeeId: e.target.value,
                            },
                          })
                        }
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#e0e0e0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#bdbdbd',
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Work sx={{ color: '#757575' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#757575' }}>Department</InputLabel>
                        <Select
                          value={formData.staffDetails.department}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              staffDetails: {
                                ...formData.staffDetails,
                                department: e.target.value,
                              },
                            })
                          }
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                              },
                              '&:hover fieldset': {
                                borderColor: '#bdbdbd',
                              },
                            },
                          }}
                        >
                          {departments.map((dept) => (
                            <MenuItem key={dept} value={dept}>
                              {dept}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#757575' }}>Availability</InputLabel>
                        <Select
                          value={formData.staffDetails.availability}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              staffDetails: {
                                ...formData.staffDetails,
                                availability: e.target.value,
                              },
                            })
                          }
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                              },
                              '&:hover fieldset': {
                                borderColor: '#bdbdbd',
                              },
                            },
                          }}
                        >
                          <MenuItem value="available">Available</MenuItem>
                          <MenuItem value="unavailable">Unavailable</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {formData.userType === 'admin' && (
                    <>
                      <Divider sx={{ my: 2, borderColor: '#e9ecef' }} />
                      <Typography variant="subtitle1" sx={{ color: '#616161' }}>
                        Staff Information
                      </Typography>
                      <TextField
                        fullWidth
                        label="Employee ID"
                        value={formData.staffDetails.employeeId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            staffDetails: {
                              ...formData.staffDetails,
                              employeeId: e.target.value,
                            },
                          })
                        }
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#e0e0e0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#bdbdbd',
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Work sx={{ color: '#757575' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#757575' }}>Department</InputLabel>
                        <Select
                          value={formData.staffDetails.department}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              staffDetails: {
                                ...formData.staffDetails,
                                department: e.target.value,
                              },
                            })
                          }
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                              },
                              '&:hover fieldset': {
                                borderColor: '#bdbdbd',
                              },
                            },
                          }}
                        >
                          {departments.map((dept) => (
                            <MenuItem key={dept} value={dept}>
                              {dept}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#757575' }}>Availability</InputLabel>
                        <Select
                          value={formData.staffDetails.availability}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              staffDetails: {
                                ...formData.staffDetails,
                                availability: e.target.value,
                              },
                            })
                          }
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                              },
                              '&:hover fieldset': {
                                borderColor: '#bdbdbd',
                              },
                            },
                          }}
                        >
                          <MenuItem value="available">Available</MenuItem>
                          <MenuItem value="unavailable">Unavailable</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}

                  <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />

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
                            sx={{ color: '#8b7355' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            sx={{ color: '#8b7355' }}
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
                      mt: 3,
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
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Create Account'}
                  </Button>

                  <Typography
                    variant="body2"
                    align="center"
                    sx={{
                      mt: 3,
                      color: '#5a6c7d',
                      fontSize: '0.95rem',
                    }}
                  >
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      style={{
                        color: '#8b7355',
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