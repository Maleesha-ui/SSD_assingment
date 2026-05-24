import React, { useState } from 'react';
import { Box, Container, Typography, Alert, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OrderForm from './OrderForm';
import StripePayment from '../../components/Payment/StripePayment';
import api from '../../services/api';

const CreateOrder = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [orderData, setOrderData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');

  const handleOrderSubmit = async (data) => {
    try {
      setError('');
      const response = await api.post('/orders', data);
      setOrderId(response.data._id);
      setOrderData(data);
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.response?.data?.message || 'Failed to create order. Please try again.');
    }
  };

  const handlePaymentSuccess = (orderId) => {
    navigate(`/order-confirmation/${orderId}`);
  };

  const handlePaymentError = (error) => {
    setError(error.message || 'Payment failed. Please try again.');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        py: 4,
        px: { xs: 2, md: 4 },
        bgcolor: theme.palette.grey[100]
      }}
    >
      <Container maxWidth="lg">
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {!orderId ? (
          <>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                mb: 4
              }}
            >
              Create New Order
            </Typography>
            <OrderForm onSubmit={handleOrderSubmit} />
          </>
        ) : (
          <>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                mb: 4
              }}
            >
              Complete Payment
            </Typography>
            <StripePayment
              orderId={orderId}
              amount={orderData.totalAmount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </>
        )}
      </Container>
    </Box>
  );
};

export default CreateOrder; 