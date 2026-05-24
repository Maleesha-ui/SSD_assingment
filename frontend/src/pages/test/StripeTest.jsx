import React, { useState } from 'react';
import { Box, Container, Alert, Typography } from '@mui/material';
import StripePayment from '../../components/Payment/StripePayment';

const StripeTest = () => {
  const [testResult, setTestResult] = useState(null);

  // Test order
  const testOrder = {
    _id: 'test_' + Date.now(),
    totalAmount: 1.00
  };

  const handleSuccess = () => {
    setTestResult({
      status: 'success',
      message: 'Payment processed successfully! Check Stripe Dashboard.'
    });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Stripe Payment Test
        </Typography>

        {testResult && (
          <Alert 
            severity={testResult.status === 'success' ? 'success' : 'error'}
            sx={{ mb: 3 }}
          >
            {testResult.message}
          </Alert>
        )}

        <Typography variant="body1" sx={{ mb: 2 }}>
          Test Card: 4242 4242 4242 4242<br />
          Expiry: Any future date<br />
          CVC: Any 3 digits
        </Typography>

        <StripePayment
          orderId={testOrder._id}
          amount={testOrder.totalAmount}
          onSuccess={handleSuccess}
        />
      </Box>
    </Container>
  );
};

export default StripeTest; 