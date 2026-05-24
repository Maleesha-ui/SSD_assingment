import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  useTheme,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  Divider,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import api from '../../../services/api';

const BookingAdmin = () => {
  const theme = useTheme();
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  
  // Report generation state
  const [reportType, setReportType] = useState('pdf');
  const [reportLoading, setReportLoading] = useState(false);
  
  // Booking edit/create state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [currentBooking, setCurrentBooking] = useState({
    customerName: '',
    contact: '',
    date: null,
    time: '',
    package: '',
    notes: ''
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/bookings/get-all-bookings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Bookings:', response.data);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load booking data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/package/get-all-packages', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter bookings based on search term and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateFilter === 'today') {
      const todayEnd = new Date(today);
      todayEnd.setDate(todayEnd.getDate() + 1);
      matchesDate = bookingDate >= today && bookingDate < todayEnd;
    } else if (dateFilter === 'upcoming') {
      matchesDate = bookingDate >= today;
    } else if (dateFilter === 'past') {
      matchesDate = bookingDate < today;
    }
    
    const matchesPackage = packageFilter === 'all' || booking.package === packageFilter;
    
    return matchesSearch && matchesDate && matchesPackage;
  });

  // Generate report functions
  const generateReport = () => {
    setReportLoading(true);
    try {
      if (reportType === 'pdf') {
        generatePdfReport();
      } else if (reportType === 'excel') {
        generateExcelReport();
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };

  const generatePdfReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Funeral Service Bookings Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Create the table data
    const tableColumn = ["Customer Name", "Contact", "Date", "Time", "Package", "Notes"];
    const tableRows = filteredBookings.map(booking => [
      booking.customerName,
      booking.contact,
      new Date(booking.date).toLocaleDateString(),
      booking.time,
      booking.package,
      booking.notes.substring(0, 30) + (booking.notes.length > 30 ? '...' : '')
    ]);
    
    // Generate the table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66] }
    });
    
    // Save the PDF
    doc.save('bookings-report.pdf');
  };

  const generateExcelReport = () => {
    // Prepare data for Excel
    const excelData = filteredBookings.map(booking => ({
      'Customer Name': booking.customerName,
      'Contact': booking.contact,
      'Date': new Date(booking.date).toLocaleDateString(),
      'Time': booking.time,
      'Package': booking.package,
      'Notes': booking.notes,
      'Created': new Date(booking.createdAt).toLocaleDateString()
    }));
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    
    // Generate Excel file
    XLSX.writeFile(workbook, "bookings-report.xlsx");
  };

  // Open dialog for creating a new booking
  const handleAddBooking = () => {
    setCurrentBooking({
      customerName: '',
      contact: '',
      date: null,
      time: '',
      package: '',
      notes: ''
    });
    setDialogAction('add');
    setOpenDialog(true);
  };

  // Open dialog for editing a booking
  const handleEditBooking = (booking) => {
    setCurrentBooking({
      ...booking,
      date: new Date(booking.date)
    });
    setDialogAction('edit');
    setOpenDialog(true);
  };

  // Handle booking form changes
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setCurrentBooking({...currentBooking, [name]: value});
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setCurrentBooking({...currentBooking, date: newDate});
  };

  // Save booking (create or update)
  const handleSaveBooking = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let response;
      
      // Format the booking data for API
      const bookingData = {
        ...currentBooking,
        date: currentBooking.date.toISOString().split('T')[0]
      };
      
      if (dialogAction === 'add') {
        response = await api.post('/admin/bookings/new-booking', bookingData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.status === 201) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Booking added successfully',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } else {
        response = await api.put(`/admin/bookings/update-booking/${currentBooking._id}`, bookingData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Booking updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      setOpenDialog(false);
      fetchBookings();
    } catch (error) {
      console.error('Error saving booking:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${dialogAction === 'add' ? 'create' : 'update'} booking`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete booking
  const handleDeleteClick = (booking) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the booking for "${booking.customerName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteBooking(booking);
      }
    });
  };

  const handleDeleteBooking = async (booking) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await api.delete(`/admin/bookings/${booking._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `Booking for "${booking.customerName}" has been deleted`,
        timer: 2000,
        showConfirmButton: false
      });
      
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to delete booking for "${booking.customerName}"`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchPackages();
  }, []);

  if (loading && bookings.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Count bookings by date category
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate.getTime() === todayDate.getTime();
  }).length;
  
  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate > todayDate;
  }).length;
  
  const pastBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate < todayDate;
  }).length;

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      bgcolor: theme.palette.grey[100],
      p: 4,
      overflow: 'auto'
    }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => window.history.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
        >
          Booking Management
        </Typography>
      </Stack>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Booking Statistics */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Booking Statistics</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box sx={{ p: 2, bgcolor: theme.palette.primary.light, borderRadius: 2, color: 'white' }}>
              <Typography variant="body2">Total Bookings</Typography>
              <Typography variant="h4">{bookings.length}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ p: 2, bgcolor: theme.palette.success.light, borderRadius: 2, color: 'white' }}>
              <Typography variant="body2">Today's Bookings</Typography>
              <Typography variant="h4">{todayBookings}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ p: 2, bgcolor: theme.palette.warning.light, borderRadius: 2, color: 'white' }}>
              <Typography variant="body2">Upcoming Bookings</Typography>
              <Typography variant="h4">{upcomingBookings}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ p: 2, bgcolor: theme.palette.error.light, borderRadius: 2, color: 'white' }}>
              <Typography variant="body2">Past Bookings</Typography>
              <Typography variant="h4">{pastBookings}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Date</InputLabel>
            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              label="Date"
            >
              <MenuItem value="all">All Dates</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="past">Past</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Package</InputLabel>
            <Select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              label="Package"
            >
              <MenuItem value="all">All Packages</MenuItem>
              {packages.map(pkg => (
                <MenuItem key={pkg._id} value={pkg.name}>{pkg.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBookings}
          >
            Refresh
          </Button>
          
          {/* Report Generation */}
          <Box sx={{ display: 'flex', ml: 'auto', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report Type"
              >
                <MenuItem value="pdf">PDF Report</MenuItem>
                <MenuItem value="excel">Excel Report</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={reportType === 'pdf' ? <PdfIcon /> : <ExcelIcon />}
              onClick={generateReport}
              disabled={reportLoading || filteredBookings.length === 0}
            >
              {reportLoading ? 'Generating...' : 'Generate Report'}
            </Button>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddBooking}
          >
            Add Booking
          </Button>
        </Box>
      </Paper>
      
      {/* Bookings Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Package</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((booking) => {
                  const bookingDate = new Date(booking.date);
                  const isToday = new Date().toDateString() === bookingDate.toDateString();
                  const isPast = bookingDate < new Date();
                  
                  return (
                    <TableRow 
                      key={booking._id} 
                      hover
                      sx={{
                        bgcolor: isToday ? 'rgba(255, 235, 59, 0.1)' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight="medium">
                          {booking.customerName}
                        </Typography>
                      </TableCell>
                      <TableCell>{booking.contact}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <EventIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          {bookingDate.toLocaleDateString()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <TimeIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          {booking.time}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.package} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography noWrap sx={{ maxWidth: 150 }}>
                          {booking.notes || 'No notes'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEditBooking(booking)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(booking)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredBookings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {filteredBookings.length === 0 && !loading && (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <Typography variant="h6" color="text.secondary">
            No bookings found matching your criteria
          </Typography>
        </Box>
      )}
      
      {/* Create/Edit Booking Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialogAction === 'add' ? 'Create New Booking' : 'Edit Booking'}
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  name="customerName"
                  value={currentBooking.customerName}
                  onChange={handleBookingChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contact"
                  value={currentBooking.contact}
                  onChange={handleBookingChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Booking Date"
                  value={currentBooking.date}
                  onChange={handleDateChange}
                  renderInput={(params) => 
                    <TextField {...params} fullWidth margin="normal" required />
                  }
                  sx={{ width: '100%', mt: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Time"
                  name="time"
                  value={currentBooking.time}
                  onChange={handleBookingChange}
                  margin="normal"
                  required
                  placeholder="e.g. 10:00 AM"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Package</InputLabel>
                  <Select
                    name="package"
                    value={currentBooking.package}
                    onChange={handleBookingChange}
                    label="Package"
                  >
                    {packages.map(pkg => (
                      <MenuItem key={pkg._id} value={pkg.name}>{pkg.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={currentBooking.notes}
                  onChange={handleBookingChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveBooking}
            disabled={!currentBooking.customerName || !currentBooking.contact || !currentBooking.date || !currentBooking.time || !currentBooking.package}
          >
            {dialogAction === 'add' ? 'Create Booking' : 'Update Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingAdmin;