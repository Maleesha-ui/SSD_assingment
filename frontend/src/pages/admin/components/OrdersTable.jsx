import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Chip,
  Box,
  Button,
  useTheme,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  PictureAsPdf as PdfIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon 
} from '@mui/icons-material';

const OrdersTable = ({ orders, onUpdateStatus, onExportPdf }) => {
  const theme = useTheme();
  const [filters, setFilters] = useState({
    search: '',
    orderStatus: 'all',
    paymentStatus: 'all',
    startDate: '',
    endDate: ''
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      orderStatus: 'all',
      paymentStatus: 'all',
      startDate: '',
      endDate: ''
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = filters.search === '' || 
      order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesOrderStatus = filters.orderStatus === 'all' || 
      order.orderStatus === filters.orderStatus;

    const matchesPaymentStatus = filters.paymentStatus === 'all' || 
      order.paymentStatus === filters.paymentStatus;

    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
    const matchesDateRange = (!filters.startDate || orderDate >= filters.startDate) &&
      (!filters.endDate || orderDate <= filters.endDate);

    return matchesSearch && matchesOrderStatus && matchesPaymentStatus && matchesDateRange;
  });

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Search Order/Customer"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Order Status</InputLabel>
              <Select
                value={filters.orderStatus}
                label="Order Status"
                onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={filters.paymentStatus}
                label="Payment Status"
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <Tooltip title="Clear Filters">
              <IconButton onClick={clearFilters} color="primary">
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<PdfIcon />}
          onClick={() => onExportPdf(filteredOrders, filters)}
          sx={{ bgcolor: theme.palette.error.main, '&:hover': { bgcolor: theme.palette.error.dark } }}
        >
          Export PDF
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.user?.name || 'N/A'}</TableCell>
                <TableCell>
                  {order.items.map(item => 
                    `${item.productName} (${item.quantity})`
                  ).join(', ')}
                </TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Select
                    value={order.orderStatus}
                    onChange={(e) => onUpdateStatus(order._id, e.target.value)}
                    size="small"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={order.paymentStatus}
                    color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrdersTable; 