import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  Box, 
  Typography, 
  Button, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Alert, 
  CircularProgress, 
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

const LeaveApproval = () => {
  const { token } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error';
    }
  };

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/admin/staff/leave-requests', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const requests = data.flatMap(staff => 
          (staff.leaveRequests || []).map(request => ({
            ...request,
            staffName: staff.name || 'Unknown',
            staffId: staff.userId || 'Unknown',
          }))
        );
        setLeaveRequests(requests);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        setError('Failed to load leave requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, [token]);

  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/staff/leave/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leaveId, status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setLeaveRequests(prev =>
        prev.map(request =>
          request._id === leaveId ? { ...request, status: newStatus } : request
        )
      );
      
      setSnackbar({
        open: true,
        message: `Leave request ${newStatus} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating leave status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update leave request status',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Leave Approval
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Staff Name</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.length > 0 ? (
                leaveRequests.map((request) => (
                  <TableRow key={request._id || Math.random().toString()}>
                    <TableCell>{request.staffName}</TableCell>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>{formatDate(request.startDate)}</TableCell>
                    <TableCell>{formatDate(request.endDate)}</TableCell>
                    <TableCell>{request.status}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <FormControl fullWidth size="small">
                          <InputLabel>Action</InputLabel>
                          <Select
                            value=""
                            onChange={(e) => handleStatusChange(request._id, e.target.value)}
                            label="Action"
                          >
                            <MenuItem value="approved">Approve</MenuItem>
                            <MenuItem value="denied">Deny</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No leave requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeaveApproval;