import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';

const PaymentsTable = ({ payments }) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Payment ID</TableCell>
            <TableCell>Order ID</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment._id}>
              <TableCell>{payment._id}</TableCell>
              <TableCell>{payment.orderId?._id}</TableCell>
              <TableCell>${payment.amount}</TableCell>
              <TableCell>{payment.paymentMethod}</TableCell>
              <TableCell>
                <Chip 
                  label={payment.status}
                  color={payment.status === 'completed' ? 'success' : 'warning'}
                />
              </TableCell>
              <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default PaymentsTable; 