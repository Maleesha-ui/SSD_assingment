import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
  Paper,
  Stack,
  Container,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  CreditCard, 
  Lock, 
  Payment as PaymentIcon,
  Security,
  CheckCircle
} from '@mui/icons-material';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import api from '../../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ orderId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { data: { clientSecret } } = await api.post('/payments/create-intent', {
        orderId,
        amount: Math.round(amount * 100)
      });

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setShowNotification(true);
      } else if (paymentIntent.status === 'succeeded') {
        try {
          const response = await api.post(`/payments/${orderId}/complete`, {
            paymentIntentId: paymentIntent.id
          });

          setPaymentSuccess(true);
          
          if (response.data.emailStatus) {
            if (!response.data.emailStatus.sent) {
              setError('Payment successful but receipt email failed to send. Please check your email settings.');
            } else {
              setSuccess('Payment successful and receipt sent to your email!');
            }
          }
          
          setShowNotification(true);
          setTimeout(() => {
            onSuccess(orderId);
          }, 2000);
        } catch (updateError) {
          console.error('Error updating payment status:', updateError);
          setError('Payment completed but confirmation failed. Please contact support.');
          setShowNotification(true);
        }
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      setShowNotification(true);
      console.error('Payment error:', err);
    }
    setProcessing(false);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  if (paymentSuccess) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          bgcolor: '#f5f7ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Card sx={{ maxWidth: 400, textAlign: 'center', p: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Payment Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your payment has been processed successfully. Redirecting to order confirmation...
          </Typography>
          <CircularProgress size={24} />
        </Card>
      </Box>
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
        bgcolor: '#f5f7ff',
        overflow: 'auto'
      }}
    >
      <form onSubmit={handleSubmit}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
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
                  Secure Payment
                </Typography>
                <Typography variant="h6">
                  Complete your order with our secure payment system
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Grid container spacing={4}>
            {/* Payment Form */}
            <Grid item xs={12} md={8}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)'
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  <Stack spacing={4}>
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: '#1976d2',
                        fontWeight: 600
                      }}>
                        <CreditCard />
                        Card Information
                      </Typography>
                      <Box
                        sx={{
                          mt: 3,
                          p: 4,
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          bgcolor: 'white',
                          '&:hover': {
                            borderColor: '#2196f3',
                            boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.1)',
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <CardElement
                          options={{
                            style: {
                              base: {
                                fontSize: '18px',
                                color: '#424770',
                                '::placeholder': {
                                  color: '#aab7c4',
                                },
                                padding: '20px 0',
                              },
                              invalid: {
                                color: '#e53935',
                              },
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={processing || !stripe}
                      startIcon={<Lock />}
                      sx={{
                        py: 2,
                        fontSize: '1.2rem',
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
                        boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)',
                        }
                      }}
                    >
                      {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={4}>
                <Card elevation={3} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom color="primary" fontWeight={600}>
                      Order Summary
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h3" color="primary" fontWeight="bold">
                      ${amount.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>

                <Card 
                  elevation={3} 
                  sx={{ 
                    borderRadius: 3,
                    bgcolor: '#f8faff'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <Security color="primary" sx={{ fontSize: 32 }} />
                      <Typography variant="h5" fontWeight={600}>
                        Secure Payment
                      </Typography>
                    </Stack>
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                      Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </form>

      <Snackbar
        open={showNotification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={paymentSuccess ? 'success' : 'error'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {paymentSuccess
            ? 'Payment processed successfully!'
            : error || 'Payment failed. Please try again.'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const StripePayment = ({ orderId, amount, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        orderId={orderId} 
        amount={amount} 
        onSuccess={onSuccess} 
      />
    </Elements>
  );
};

export default StripePayment; 