import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Stack
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, isValid } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AttendanceReport = () => {
  const { token } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [staffList, setStaffList] = useState([]);
  
  const [filters, setFilters] = useState({
    staffId: '',
    startDate: null,
    endDate: null
  });

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  useEffect(() => {
    const fetchAttendanceReport = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/staff/attendance-report', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const uniqueStaff = data.map(staff => ({
          id: staff.userId,
          name: staff.name,
          email: staff.email
        }));
        setStaffList(uniqueStaff);
        
        const processedRecords = [];
        
        data.forEach(staff => {
          if (staff.attendance && Array.isArray(staff.attendance)) {
            staff.attendance.forEach(record => {
              if (record && record._id) {
                processedRecords.push({
                  id: record._id, 
                  staffId: staff.userId,
                  staffName: staff.name,
                  staffEmail: staff.email,
                  dateStr: record.date, 
                  formattedDate: formatDate(record.date),
                  checkIn: record.checkIn || 'N/A',
                  checkOut: record.checkOut || 'N/A'
                });
              }
            });
          }
        });
        
        setAttendanceData(processedRecords);
        setFilteredData(processedRecords);
        setError('');
      } catch (error) {
        console.error('Error fetching attendance report:', error);
        setError('Failed to load attendance data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendanceReport();
  }, [token]);

  useEffect(() => {
    if (attendanceData.length === 0) return;
    
    let filtered = [...attendanceData];
    
    if (filters.staffId) {
      filtered = filtered.filter(record => record.staffId === filters.staffId);
    }
    
    if (filters.startDate && isValid(filters.startDate)) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(record => {
        try {
          const recordDate = new Date(record.dateStr);
          return isValid(recordDate) && recordDate >= startDate;
        } catch (e) {
          return false;
        }
      });
    }
    
    if (filters.endDate && isValid(filters.endDate)) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(record => {
        try {
          const recordDate = new Date(record.dateStr);
          return isValid(recordDate) && recordDate <= endDate;
        } catch (e) {
          return false;
        }
      });
    }
    
    setFilteredData(filtered);
  }, [filters, attendanceData]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      staffId: '',
      startDate: null,
      endDate: null
    });
  };

  const columns = [
    { field: 'staffName', headerName: 'Staff Name', width: 180 },
    { field: 'staffEmail', headerName: 'Email', width: 200 },
    { field: 'formattedDate', headerName: 'Date', width: 150 },
    { field: 'checkIn', headerName: 'Check-In', width: 120 },
    { field: 'checkOut', headerName: 'Check-Out', width: 120 },
  ];

  const exportToPdf = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Attendance Report', 14, 22);
    
    let subtitle = 'All Staff';
    if (filters.staffId) {
      const staff = staffList.find(s => s.id === filters.staffId);
      if (staff) {
        subtitle = `Staff: ${staff.name}`;
      }
    }
    
    let dateRange = '';
    if (filters.startDate && isValid(filters.startDate)) {
      dateRange += `From: ${formatDate(filters.startDate)}`;
    }
    if (filters.endDate && isValid(filters.endDate)) {
      dateRange += dateRange ? ` To: ${formatDate(filters.endDate)}` : `To: ${formatDate(filters.endDate)}`;
    }
    
    doc.setFontSize(12);
    doc.text(subtitle, 14, 30);
    if (dateRange) {
      doc.text(dateRange, 14, 38);
    }
    
    doc.setFontSize(10);
    doc.text(`Report generated on: ${formatDate(new Date())} ${new Date().toLocaleTimeString()}`, 14, 46);
    
    const tableColumn = ['Staff Name', 'Email', 'Date', 'Check In', 'Check Out'];
    const tableRows = filteredData.map(record => [
      record.staffName,
      record.staffEmail,
      record.formattedDate,
      record.checkIn,
      record.checkOut
    ]);
    
    doc.autoTable({
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      headStyles: {
        fillColor: [66, 66, 99],
        textColor: [255, 255, 255]
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    doc.save(`attendance_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h4" gutterBottom>
          Attendance Report
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filter Options
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="staff-filter-label">Staff Member</InputLabel>
                <Select
                  labelId="staff-filter-label"
                  value={filters.staffId}
                  onChange={(e) => handleFilterChange('staffId', e.target.value)}
                  label="Staff Member"
                >
                  <MenuItem value="">All Staff</MenuItem>
                  {staffList.map(staff => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(newValue) => handleFilterChange('startDate', newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(newValue) => handleFilterChange('endDate', newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="outlined" 
                  onClick={clearFilters} 
                  sx={{ minWidth: 100 }}
                >
                  Clear
                </Button>
                <Button 
                  variant="contained" 
                  onClick={exportToPdf} 
                  color="primary" 
                  sx={{ minWidth: 100 }}
                >
                  Export PDF
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredData.length > 0 ? (
          <DataGrid
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row.id}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{ height: 600, width: '100%' }}
          />
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No attendance records found with the current filters.
            </Typography>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AttendanceReport;