import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { TextField, Button, Box, MenuItem, Typography, Select, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import api from '../../../services/api';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { format } from 'date-fns';

const sweetAlertStyles = `
  .swal-popup {
    border-radius: 10px;
  }
  .swal-title {
    font-weight: 500;
  }
`;

const AssignTask = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    staffId: '',
    taskTitle: '',
    taskDescription: '',
    startDate: null,
    dueDate: null,
    priorityLevel: '',
    attachments: '',
  });
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('');

  useEffect(() => {
    const testApiConnection = async () => {
      try {
        console.log('Testing API connection...');
        await api.get('/admin/debug');
        console.log('API connection successful');
        setApiStatus('connected');
      } catch (error) {
        console.error('API connection test failed:', error);
        setError('Cannot connect to the API. Please check if the backend server is running.');
        setApiStatus('disconnected');
      }
    };
    
    testApiConnection();
    
    const fetchStaffList = async () => {
      try {
        console.log('Fetching staff list...');
        const response = await api.get('/admin/users?role=staff');
        console.log('Staff list response:', response.data);
        const staffUsers = response.data.filter(user => user.role === 'staff');
        console.log('Filtered staff users:', staffUsers);
        setStaffList(staffUsers);
      } catch (error) {
        console.error('Error fetching staff list:', error);
      }
    };
    fetchStaffList();
  }, []);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = sweetAlertStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  // Format date to ISO string for backend
  const formatDateForBackend = (date) => {
    if (!date) return null;
    // Ensure we have a Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.staffId) {
      setError('Please select a staff member');
      setLoading(false);
      return;
    }
    if (!formData.taskTitle) {
      setError('Please enter a task title');
      setLoading(false);
      return;
    }
    if (!formData.startDate || !formData.dueDate) {
      setError('Please select both start and due dates');
      setLoading(false);
      return;
    }
    if (!formData.priorityLevel) {
      setError('Please select a priority level');
      setLoading(false);
      return;
    }

    try {
      const formattedData = {
        ...formData,
        startDate: formatDateForBackend(formData.startDate),
        dueDate: formatDateForBackend(formData.dueDate),
        attachments: formData.attachments ? [formData.attachments] : []
      };

      console.log('Submitting task data:', formattedData);
      
      try {
        await api.get('/admin/debug');
      } catch (debugError) {
        console.error('API debug check failed:', debugError);
        setError('Cannot connect to the API. Please check if the backend server is running.');
        setLoading(false);
        return;
      }
      
      const response = await api.post('/admin/staff/assign-task', formattedData);
      console.log('Task assignment response:', response);
      
      if (response.status === 201) {
        const staffMember = staffList.find(staff => staff._id === formData.staffId);
        const staffName = staffMember ? staffMember.name : 'Selected staff';
        
        const startDateFormatted = formData.startDate ? format(new Date(formData.startDate), 'MMM dd, yyyy') : 'Not set';
        const dueDateFormatted = formData.dueDate ? format(new Date(formData.dueDate), 'MMM dd, yyyy') : 'Not set';
        
        Swal.fire({
          icon: 'success',
          title: '<span style="color: #1e88e5">Task Assigned Successfully!</span>',
          html: `
            <div style="text-align: left; margin: 20px 10px; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background-color: #f5f5f5;">
              <p style="margin: 8px 0;"><strong style="color: #424242;">Staff:</strong> <span style="color: #616161;">${staffName}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #424242;">Task:</strong> <span style="color: #616161;">${formData.taskTitle}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #424242;">Priority:</strong> <span style="color: #616161; text-transform: capitalize;">${formData.priorityLevel}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #424242;">Start Date:</strong> <span style="color: #616161;">${startDateFormatted}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #424242;">Due Date:</strong> <span style="color: #616161;">${dueDateFormatted}</span></p>
            </div>
          `,
          confirmButtonColor: '#1e88e5',
          confirmButtonText: 'OK',
          background: '#ffffff',
          iconColor: '#4caf50',
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          },
          customClass: {
            title: 'swal-title',
            popup: 'swal-popup'
          }
        });
        
        setSuccess('Task assigned successfully');
        setFormData({
          staffId: '',
          taskTitle: '',
          taskDescription: '',
          startDate: null,
          dueDate: null,
          priorityLevel: '',
          attachments: '',
        });
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 404) {
        if (error.response.data.message === 'Staff not found') {
          setError('Staff record not found. The system will create one automatically. Please try again.');
        } else {
          setError(error.response.data.message || 'Resource not found');
        }
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (!error.response) {
        setError('Network error. Please check your connection.');
      } else {
        setError(error.response?.data?.message || 'An error occurred while assigning the task');
      }
      
      Swal.fire({
        icon: 'error',
        title: '<span style="color: #f44336">Error</span>',
        html: `
          <div style="text-align: left; margin: 20px 10px; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background-color: #fff4f4;">
            <p style="margin: 8px 0; color: #616161;">${error.response?.data?.message || 'An error occurred while assigning the task'}</p>
          </div>
        `,
        confirmButtonColor: '#1e88e5',
        confirmButtonText: 'OK',
        background: '#ffffff',
        iconColor: '#f44336',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        },
        customClass: {
          title: 'swal-title',
          popup: 'swal-popup'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Assign Task
      </Typography>
      
      {apiStatus === 'disconnected' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Cannot connect to the API. Please check if the backend server is running.
        </Alert>
      )}
      
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      {success && <Typography color="success" sx={{ mb: 2 }}>{success}</Typography>}
      
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Staff Member</InputLabel>
          <Select
            name="staffId"
            value={formData.staffId}
            onChange={handleChange}
          >
            {staffList.map((staff) => (
              <MenuItem key={staff._id} value={staff._id}>
                {staff.name} ({staff.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Task Title"
          name="taskTitle"
          value={formData.taskTitle}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Description"
          name="taskDescription"
          value={formData.taskDescription}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={3}
        />
        <DatePicker
          label="Start Date"
          value={formData.startDate}
          onChange={(date) => handleDateChange('startDate')(date)}
          slotProps={{ textField: { fullWidth: true, margin: "normal", required: true } }}
        />
        <DatePicker
          label="Due Date"
          value={formData.dueDate}
          onChange={(date) => handleDateChange('dueDate')(date)}
          slotProps={{ textField: { fullWidth: true, margin: "normal", required: true } }}
        />
        <TextField
          fullWidth
          select
          label="Priority Level"
          name="priorityLevel"
          value={formData.priorityLevel}
          onChange={handleChange}
          margin="normal"
          required
        >
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </TextField>
        <TextField
          fullWidth
          label="Attachments (URL)"
          name="attachments"
          value={formData.attachments}
          onChange={handleChange}
          margin="normal"
          placeholder="Enter attachment URL (optional)"
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading || apiStatus === 'disconnected'}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Assign Task'}
        </Button>
      </form>
    </Box>
  );
};

export default AssignTask;