import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Button,
  useTheme
} from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';

const PaymentsTable = ({ payments, onExportPdf }) => {
  const theme = useTheme();

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<PdfIcon />}
          onClick={onExportPdf}
          sx={{ bgcolor: theme.palette.error.main, '&:hover': { bgcolor: theme.palette.error.dark } }}
        >
          Export PDF
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Order Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell>{payment.transactionId}</TableCell>
                <TableCell>{payment.orderId?.orderNumber || 'N/A'}</TableCell>
                <TableCell>{payment.orderId?.user?.name || 'N/A'}</TableCell>
                <TableCell>${payment.amount.toFixed(2)}</TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell>
                  <Chip 
                    label={payment.status}
                    color={payment.status === 'completed' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(payment.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PaymentsTable; 