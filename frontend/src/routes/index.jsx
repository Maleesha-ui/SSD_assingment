import React from 'react';
import { Route, Routes } from 'react-router-dom';
import OrderConfirmation from '../pages/orders/OrderConfirmation';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
    </Routes>
  );
};

export default AppRoutes; 