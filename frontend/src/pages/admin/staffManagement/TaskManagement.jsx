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
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../../../services/api';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/staff/tasks');
        setTasks(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching staff tasks:', error);
        setError('Failed to load staff tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.taskDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.staffName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Staff Task Management
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1, bgcolor: '#e3f2fd' }}>
          <Typography variant="body2">Total Tasks</Typography>
          <Typography variant="h6">{totalTasks}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: '#e8f5e9' }}>
          <Typography variant="body2">Completed</Typography>
          <Typography variant="h6" color="success.main">{completedTasks}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: '#fff3e0' }}>
          <Typography variant="body2">Pending</Typography>
          <Typography variant="h6" color="warning.main">{pendingTasks}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: '#f5f5f5' }}>
          <Typography variant="body2">Completion Rate</Typography>
          <Typography variant="h6">{completionRate}%</Typography>
        </Paper>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by task title, description or staff name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : filteredTasks.length === 0 ? (
        <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
          No tasks found
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Staff Name</TableCell>
                <TableCell>Task Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Completed Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell>{task.staffName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {task.taskTitle}
                    </Typography>
                  </TableCell>
                  <TableCell>{task.taskDescription}</TableCell>
                  <TableCell>
                    <Chip
                      label={task.priorityLevel}
                      size="small"
                      sx={{
                        backgroundColor: getPriorityColor(task.priorityLevel),
                        color: 'white',
                        textTransform: 'capitalize'
                      }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(task.startDate)}</TableCell>
                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      color={task.status === 'completed' ? 'success' : 'default'}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>{task.completedDate ? formatDate(task.completedDate) : 'Not completed'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TaskManagement; 