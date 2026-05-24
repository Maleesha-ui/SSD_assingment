import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  useTheme,
  IconButton
} from '@mui/material';
import {
  Payment as PaymentIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Payments = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUnpaidOrders();
  }, []);

  const fetchUnpaidOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/pending-payments');
      setUnpaidOrders(response.data);
    } catch (err) {
      setError('Failed to fetch pending payments');
      console.error('Error fetching pending payments:', err);
    } finally {
      setLoading(false);
    }
  };

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
              <PaymentIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Pending Payments
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

          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Order Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unpaidOrders.map((order) => (
                  <TableRow 
                    key={order._id}
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: theme.palette.action.hover }
                    }}
                  >
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {order.items.map(item => 
                        `${item.productName} (${item.quantity})`
                      ).join(', ')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="Unpaid"
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<NavigateNextIcon />}
                        onClick={() => navigate(`/payment/${order._id}`)}
                        sx={{ 
                          borderRadius: 2,
                          bgcolor: theme.palette.primary.main,
                          '&:hover': { 
                            bgcolor: theme.palette.primary.dark,
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        PAY NOW
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Payments; 