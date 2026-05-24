import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  CircularProgress,
  IconButton,
  Chip,
  Stack,
  Container,
  Paper,
  Divider,
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  PaymentOutlined as PaymentIcon,
  Home as HomeIcon,
  AccessTime,
  Receipt,
  ArrowForward,
  CreditCard,
  ShoppingBag,
  LocalShipping,
  Info,
  Security
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StripePayment from '../../components/Payment/StripePayment';

const PaymentPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        const response = await api.get('/orders/pending-payments');
        setPendingPayments(response.data);
      } catch (error) {
        console.error('Error fetching pending payments:', error);
        setError('Failed to load pending payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingPayments();
  }, []);

  const handlePaymentSuccess = (orderId) => {
    setPendingPayments(prev => prev.filter(order => order._id !== orderId));
    setSelectedOrder(null);
    navigate('/orders');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (selectedOrder) {
    return (
      <Box sx={{ p: 4, minHeight: '100vh', bgcolor: theme.palette.grey[100] }}>
        <StripePayment
          orderId={selectedOrder._id}
          amount={selectedOrder.totalAmount}
          onSuccess={handlePaymentSuccess}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      bgcolor: theme.palette.grey[50],
      overflow: 'auto'
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            borderRadius: 3,
            color: 'white'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <PaymentIcon sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h3" fontWeight="bold">
                Pending Payments
              </Typography>
              <Typography variant="h6">
                Manage and complete your pending payments
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <IconButton
                onClick={() => navigate('/')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <HomeIcon />
              </IconButton>
            </Box>
          </Stack>
        </Paper>

        <Grid container spacing={4}>
          {/* Main Content - Payment Cards */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              {pendingPayments.map((order) => (
                <Grid item xs={12} md={6} key={order._id}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 48px rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <ShoppingBag sx={{ color: 'primary.main', fontSize: 24 }} />
                          <Typography variant="h6" fontWeight="bold">
                            Order #{order.orderNumber}
                          </Typography>
                        </Box>

                        <Divider />

                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography color="text.secondary">Amount Due:</Typography>
                            <Typography variant="h5" color="primary.main" fontWeight="bold">
                              ${order.totalAmount.toFixed(2)}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(order.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Stack>

                        <Divider />

                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Order Details:
                          </Typography>
                          <Stack spacing={1}>
                            {order.items?.map((item, index) => (
                              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">
                                  {item.product.name} x {item.quantity}
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  ${(item.product.price * item.quantity).toFixed(2)}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Box>

                        <Button
                          variant="contained"
                          size="large"
                          endIcon={<CreditCard />}
                          onClick={() => setSelectedOrder(order)}
                          sx={{
                            mt: 2,
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
                            boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)',
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          Pay Now
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Side Panel */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Payment Summary */}
              <Card sx={{ 
                borderRadius: 3,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Payment Summary
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total Orders:</Typography>
                      <Typography fontWeight="bold">{pendingPayments.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total Amount Due:</Typography>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        ${pendingPayments.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Secure Payment Info */}
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security color="primary" />
                      <Typography variant="h6" fontWeight="bold">
                        Secure Payment
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      We use industry-standard encryption to protect your payment information.
                      All transactions are secure and processed through Stripe.
                    </Typography>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'primary.light', 
                      borderRadius: 2,
                      color: 'primary.main'
                    }}>
                      <Typography variant="body2" fontWeight="medium">
                        💡 Tip: You can pay multiple orders at once to save time!
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Need Help Section */}
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight="bold">
                      Need Help?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      If you have any questions about your payment, our support team is here to help.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Info />}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      Contact Support
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PaymentPage; 