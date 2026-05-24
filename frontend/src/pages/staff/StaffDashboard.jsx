import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Divider,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Container,
  LinearProgress
} from '@mui/material';
import TaskList from '../../components/staffManagement/TaskList';
import LeaveRequestForm from '../../components/staffManagement/LeaveRequestForm';
import LeaveStatus from '../../components/staffManagement/LeaveStatus';
import Attendance from '../../components/staffManagement/Attendance';
import StaffProfile from '../../components/staffManagement/StaffProfile';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import HistoryIcon from '@mui/icons-material/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import api from '../../services/api';
import { format } from 'date-fns';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get current date
  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/staff/tasks');
        setTasks(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const highPriorityTasks = tasks.filter(task => task.priorityLevel === 'high' && task.status === 'pending').length;
  
  // Calculate completion percentage
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const tabIcons = [
    <DashboardIcon />,
    <AssignmentIcon />,
    <EventBusyIcon />,
    <HistoryIcon />,
    <AccessTimeIcon />
  ];

  // Function to generate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    // FIXED: Removed maxWidth constraint and set width to 100%
    <Box sx={{ 
       width: '100%',
  minHeight: '100vh',
  bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#121212',
  display: 'flex',
  flexDirection: 'column'
    }}>
     
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: theme.palette.primary.main,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 2, fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Staff Dashboard
            </Typography>
            <Typography variant="subtitle2">
              {currentDate}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit" size="large">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit" size="large">
            <SettingsIcon />
          </IconButton>
          <Avatar 
            sx={{ 
              ml: 2,
              bgcolor: theme.palette.secondary.main,
              cursor: 'pointer'
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
        </Box>
      </Paper>

      
       <Container 
    maxWidth={false} 
    sx={{ 
      px: { xs: 1, sm: 2, md: 3 }, 
      pb: 3, 
      flex: 1,
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
        {/* Welcome message */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
            color: 'white',
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {getGreeting()}, {user?.name}!
          </Typography>
          <Typography variant="body1">
            Here's your activity summary for today
          </Typography>
        </Paper>

        {/* Dashboard Summary Cards */}
        {tabValue === 0 && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 2,
                      height: '100%',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 3
                      }
                    }}
                  >
                     <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">Total Tasks</Typography>
                        <Typography variant="h4" fontWeight="bold">{totalTasks}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                        <AssignmentIcon />
                      </Avatar>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 2,
                      height: '100%',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">Completed</Typography>
                        <Typography variant="h4" fontWeight="bold" color="success.main">{completedTasks}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                        <DashboardIcon />
                      </Avatar>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 2,
                      height: '100%',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">Pending</Typography>
                        <Typography variant="h4" fontWeight="bold" color="warning.main">{pendingTasks}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
                        <HistoryIcon />
                      </Avatar>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 2,
                      height: '100%',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">High Priority</Typography>
                        <Typography variant="h4" fontWeight="bold" color="error.main">{highPriorityTasks}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: theme.palette.error.light }}>
                        <NotificationsIcon />
                      </Avatar>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <Typography variant="body1" fontWeight="medium" gutterBottom>
                  Task Completion
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h4" fontWeight="bold" sx={{ mr: 1 }}>
                    {completionPercentage}%
                  </Typography>
                  <Chip 
                    label={completionPercentage > 70 ? "Good" : completionPercentage > 40 ? "Average" : "Needs Attention"} 
                    size="small"
                    color={completionPercentage > 70 ? "success" : completionPercentage > 40 ? "warning" : "error"}
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={completionPercentage} 
                  sx={{ 
                    mb: 1,
                    height: 8,
                    borderRadius: 5,
                    bgcolor: theme.palette.grey[200]
                  }}
                />
                <Typography variant="body2" color="textSecondary">
                  {completedTasks} of {totalTasks} tasks completed
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tabs with Icons - FIXED: Full width tabs */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            mb: 3,
            width: '100%'
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{ 
              bgcolor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
              width: '100%'
            }}
          >
            <Tab 
              icon={tabIcons[0]} 
              label={!isMobile && "Dashboard"} 
              iconPosition="start"
              sx={{ 
                minHeight: 64,
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.95rem'
              }}
            />
            <Tab 
              icon={tabIcons[1]} 
              label={!isMobile && "Tasks"} 
              iconPosition="start"
              sx={{ 
                minHeight: 64,
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.95rem'
              }}
            />
            <Tab 
              icon={tabIcons[2]} 
              label={!isMobile && "Leave Request"} 
              iconPosition="start"
              sx={{ 
                minHeight: 64,
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.95rem'
              }}
            />
            <Tab 
              icon={tabIcons[3]} 
              label={!isMobile && "Leave Status"} 
              iconPosition="start"
              sx={{ 
                minHeight: 64,
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.95rem'
              }}
            />
            <Tab 
              icon={tabIcons[4]} 
              label={!isMobile && "Attendance"} 
              iconPosition="start"
              sx={{ 
                minHeight: 64,
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.95rem'
              }}
            />
          </Tabs>

          {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

          <Box sx={{ p: 3 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {tabValue === 0 && <StaffProfile />}
                {tabValue === 1 && (
                  <Box sx={{ width: '100%', flex: 1 }}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                      My Tasks
                    </Typography>
                    <TaskList />
                  </Box>
                )}
                {tabValue === 2 && (
                  <Box sx={{ width: '100%', flex: 1 }}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                      Request Leave
                    </Typography>
                    <LeaveRequestForm />
                  </Box>
                )}
                {tabValue === 3 && (
                  <Box sx={{ width: '100%', flex: 1 }}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                      Leave Status
                    </Typography>
                    <LeaveStatus />
                  </Box>
                )}
                {tabValue === 4 && (
                  <Box sx={{ width: '100%', flex: 1 }}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                      Attendance Records
                    </Typography>
                    <Attendance />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default StaffDashboard;