import React from 'react';
import { useNavigate } from 'react-router-dom';
import StripePayment from '../../components/Payment/StripePayment';

const CheckoutPage = ({ order }) => {
  const navigate = useNavigate();

  return (
    <StripePayment 
      orderId={order._id}
      amount={order.totalAmount}
      onSuccess={() => {
        // Handle successful payment
        navigate('/order-confirmation');
      }}
    />
  );
};

export default CheckoutPage; 