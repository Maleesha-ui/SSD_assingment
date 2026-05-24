import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Typography,
  Select,
  MenuItem
} from '@mui/material';

const OrdersTable = ({ orders, onUpdateStatus }) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Items</TableCell>
            <TableCell>Total Amount</TableCell>
            <TableCell>Payment Status</TableCell>
            <TableCell>Order Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell>{order._id}</TableCell>
              <TableCell>
                <Typography variant="body2">{order.user?.name}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {order.user?.email}
                </Typography>
              </TableCell>
              <TableCell>
                {order.items.map((item, index) => (
                  <Typography key={index} variant="caption" display="block">
                    {item.productName} x {item.quantity}
                  </Typography>
                ))}
              </TableCell>
              <TableCell>${order.totalAmount}</TableCell>
              <TableCell>
                <Chip 
                  label={order.paymentStatus}
                  color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={order.status}
                  color={getStatusColor(order.status)}
                />
              </TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order._id, e.target.value)}
                  size="small"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default OrdersTable; 