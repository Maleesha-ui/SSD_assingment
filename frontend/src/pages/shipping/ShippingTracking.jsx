import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Divider,
  useTheme,
  IconButton,
  Paper,
  Chip,
  Container,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocalShipping,
  Home as HomeIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Schedule as PendingIcon,
  Schedule,
  Inventory,
  CheckCircle,
  LocationOn
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ShippingTracking = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const steps = [
    { label: 'Pending', icon: <Schedule /> },
    { label: 'Processing', icon: <Inventory /> },
    { label: 'Delivery', icon: <LocalShipping /> },
    { label: 'Delivered', icon: <CheckCircle /> }
  ];

  useEffect(() => {
    if (!user?._id) {
      navigate('/login');
      return;
    }
    fetchShippingOrders();
  }, [user, navigate]);

  const fetchShippingOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(`/orders/user-shipping/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch shipping details');
      console.error('Error fetching shipping details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    return steps.findIndex(step => step.label.toLowerCase() === status.toLowerCase());
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        bgcolor: theme.palette.grey[100],
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <Container 
        maxWidth={false} 
        disableGutters 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          m: 0,
          p: 0
        }}
      >
        <Card sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          boxShadow: 'none',
          m: 0
        }}>
          <CardContent 
            sx={{ 
              flexGrow: 1,
              overflow: 'auto',
              p: { xs: 2, md: 3 },
              '&:last-child': { pb: { xs: 2, md: 3 } }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              mb: 4 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocalShipping sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                   Status
                </Typography>
              </Box>
              <IconButton
                onClick={() => navigate('/')}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <HomeIcon />
              </IconButton>
            </Box>

            {orders.map((order) => (
              <Paper 
                key={order._id}
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 2,
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 2,
                      pb: 2,
                      borderBottom: `1px solid ${theme.palette.grey[300]}`
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LocationOn sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Order #{order.orderNumber}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        onClick={() => navigate(`/track/${order._id}`)}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          px: 3
                        }}
                      >
                        Track Details
                      </Button>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Payment Status: 
                        <Chip 
                          label={order.paymentStatus}
                          color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography variant="subtitle1">
                        Total Amount: <strong>${order.totalAmount.toFixed(2)}</strong>
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Stepper 
                      activeStep={getStepIndex(order.orderStatus)} 
                      alternativeLabel
                      sx={{ 
                        my: 3,
                        '& .MuiStepLabel-root .Mui-completed': {
                          color: theme.palette.success.main
                        },
                        '& .MuiStepLabel-root .Mui-active': {
                          color: theme.palette.primary.main
                        }
                      }}
                    >
                      {steps.map((step) => (
                        <Step key={step.label}>
                          <StepLabel StepIconComponent={() => step.icon}>{step.label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ShippingTracking; 