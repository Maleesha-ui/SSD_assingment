import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  useTheme,
  IconButton,
  TablePagination,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  History as HistoryIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';

const OrderHistory = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportMenuAnchor, setReportMenuAnchor] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!user?._id) {
        console.log('No user ID found:', user);
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        console.log('Token present:', !!token);
        
        const response = await api.get('/orders/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Response received:', response.status);
        
        if (response.data) {
          console.log('Orders found:', response.data.length);
          setOrders(response.data);
        } else {
          console.log('No orders found');
          setOrders([]);
        }
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          token: !!localStorage.getItem('token')
        });
        setError(error.response?.data?.message || 'Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [user]);

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      cancelled: 'error'
    };
    return statusColors[status] || 'default';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Report generation functions
  const handleReportMenuOpen = (event) => {
    setReportMenuAnchor(event.currentTarget);
  };

  const handleReportMenuClose = () => {
    setReportMenuAnchor(null);
  };

  const generatePdfReport = () => {
    const doc = new jsPDF();
    
    // Add title and header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('Order History Report', 15, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 30);
    
    // Prepare table data
    const tableColumn = [
      "Order #",
      "Date",
      "Items",
      "Amount",
      "Status"
    ];
    
    const tableRows = orders.map(order => [
      order.orderNumber || 'N/A',
      new Date(order.date).toLocaleDateString(),
      order.items.map(item => `${item.productName} (${item.quantity})`).join('\n'),
      `$${order.totalAmount.toFixed(2)}`,
      order.status
    ]);

    // Generate table with autoTable
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Order number
        1: { cellWidth: 25 }, // Date
        2: { cellWidth: 70 }, // Items
        3: { cellWidth: 25 }, // Amount
        4: { cellWidth: 25 }  // Status
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Save the PDF
    doc.save(`order_history_${new Date().getTime()}.pdf`);
    handleReportMenuClose();
  };

  const generateExcelReport = () => {
    // Prepare data
    const excelData = orders.map(order => ({
      'Order Number': order.orderNumber,
      'Items': order.items.map(item => `${item.productName} (${item.quantity})`).join(', '),
      'Total Amount': `$${order.totalAmount.toFixed(2)}`,
      'Order Status': order.status,
      'Payment Status': order.paymentStatus,
      'Date': new Date(order.date).toLocaleDateString()
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Order History');
    
    // Generate Excel file
    XLSX.writeFile(workbook, 'order_history_report.xlsx');
    handleReportMenuClose();
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Order History Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { 
              border-collapse: collapse; 
              width: 100%;
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px 8px; 
              text-align: left; 
            }
            th { 
              background-color: #2980b9; 
              color: white;
            }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { 
              text-align: center;
              margin-bottom: 30px;
            }
            .date { 
              text-align: right;
              color: #666;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Order History Report</h2>
          </div>
          <div class="date">
            Generated on: ${new Date().toLocaleDateString()}
          </div>
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Order Status</th>
                <th>Payment Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${order.items.map(item => `${item.productName} (${item.quantity})`).join(', ')}</td>
                  <td>$${order.totalAmount.toFixed(2)}</td>
                  <td>${order.status}</td>
                  <td>${order.paymentStatus}</td>
                  <td>${new Date(order.date).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };

    handleReportMenuClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
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
        bgcolor: theme.palette.grey[100],
        p: 4,
        overflow: 'auto'
      }}
    >
      <Card
        sx={{
          maxWidth: 1200,
          margin: '0 auto',
          borderRadius: 3,
          boxShadow: theme.shadows[10]
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <HistoryIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Order History
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Generate Report">
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleReportMenuOpen}
                  sx={{
                    bgcolor: theme.palette.success.main,
                    '&:hover': { bgcolor: theme.palette.success.dark }
                  }}
                >
                  Generate Report
                </Button>
              </Tooltip>
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
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }} id="orderHistoryTable">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Order Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Order Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Payment Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow 
                      key={order._id}
                      hover
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: theme.palette.action.hover }
                      }}
                    >
                      <TableCell>{order.orderNumber}</TableCell>
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
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{ fontWeight: 'medium' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={order.paymentStatus}
                          color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                          size="small"
                          sx={{ fontWeight: 'medium' }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary"
                          onClick={() => navigate(`/track/${order._id}`)}
                          sx={{ 
                            '&:hover': { 
                              transform: 'scale(1.1)',
                              bgcolor: theme.palette.primary.light 
                            }
                          }}
                        >
                          <NavigateNextIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={orders.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      {/* Report Generation Menu */}
      <Menu
        anchorEl={reportMenuAnchor}
        open={Boolean(reportMenuAnchor)}
        onClose={handleReportMenuClose}
      >
        <MenuItem onClick={generatePdfReport}>
          <PdfIcon sx={{ mr: 1, color: theme.palette.error.main }} />
          Export as PDF
        </MenuItem>
        <MenuItem onClick={generateExcelReport}>
          <ExcelIcon sx={{ mr: 1, color: theme.palette.success.main }} />
          Export as Excel
        </MenuItem>
        <MenuItem onClick={printReport}>
          <PrintIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          Print Report
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default OrderHistory; 