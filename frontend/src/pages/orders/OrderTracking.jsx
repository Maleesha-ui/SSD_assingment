import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  IconButton,
  useTheme
} from '@mui/material';
import {
  LocalShipping,
  Home as HomeIcon,
  CheckCircle,
  Schedule,
  Inventory
} from '@mui/icons-material';
import api from '../../services/api';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const steps = [
    { label: 'Pending', icon: <Schedule /> },
    { label: 'Processing', icon: <Inventory /> },
    { label: 'Shipped', icon: <LocalShipping /> },
    { label: 'Delivered', icon: <CheckCircle /> }
  ];

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch order details');
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
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: theme.palette.grey[100],
        p: 4,
        overflow: 'auto'
      }}
    >
      <Card sx={{ maxWidth: 1200, margin: '0 auto', borderRadius: 3, boxShadow: theme.shadows[10] }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalShipping sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Order Tracking
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

          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Order Number: <strong>{order.orderNumber}</strong>
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Order Date: <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Payment Status: 
                  <Chip 
                    label={order.paymentStatus}
                    color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Total Amount: <strong>${order.totalAmount.toFixed(2)}</strong>
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Stepper 
            activeStep={getStepIndex(order.orderStatus)} 
            alternativeLabel
            sx={{ 
              mb: 4,
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

          <Typography variant="h6" gutterBottom sx={{ mb: 2, color: theme.palette.primary.main }}>
            Order Items
          </Typography>
          <Grid container spacing={2}>
            {order.items.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Paper 
                  sx={{ 
                    p: 2,
                    borderRadius: 2,
                    '&:hover': { boxShadow: theme.shadows[4] },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={8}>
                      <Typography variant="subtitle1">{item.productName}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body1">Qty: {item.quantity}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderTracking; 