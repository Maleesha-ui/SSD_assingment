import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Typography,
} from '@mui/material';
import {
  Person as UserIcon,
  ShoppingCart,
  Payment as PaymentIcon,
  Assessment as StatsIcon,
  Feedback as FeedbackIcon,
  SupervisedUserCircle as StaffIcon,
  Task as TaskIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatsCard from '../../components/admin/StatsCard';
import UsersTable from '../../components/admin/UsersTable';
import OrdersTable from '../../components/admin/OrdersTable';
import PaymentsTable from '../../components/admin/PaymentsTable';
import AssignTask from '../../pages/admin/staffManagement/AssignTask';
import LeaveApproval from '../../pages/admin/staffManagement/LeaveApproval';
import AttendanceReport from '../../pages/admin/staffManagement/AttendanceReport';
import TaskManagement from '../../pages/admin/staffManagement/TaskManagement';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [subTabValue, setSubTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    stats: {
      totalOrders: 0,
      totalRevenue: 0,
      totalUsers: 0,
      pendingOrders: 0,
    },
    users: [],
    orders: [],
    payments: [],
  });
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [stats, users, orders, payments] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/admin/orders'),
        api.get('/api/admin/payments'),
      ]);

      setData({
        stats: stats.data,
        users: users.data,
        orders: orders.data,
        payments: payments.data,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<FeedbackIcon />}
          onClick={() => navigate('/admin/feedback')}
          sx={{ ml: 2 }}
        >
          View Feedback
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Users"
            value={data.stats.totalUsers}
            icon={<UserIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Orders"
            value={data.stats.totalOrders}
            icon={<ShoppingCart />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Revenue"
            value={`$${data.stats.totalRevenue.toFixed(2)}`}
            icon={<PaymentIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending Orders"
            value={data.stats.pendingOrders}
            icon={<StatsIcon />}
          />
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => {
            setTabValue(newValue);
            setSubTabValue(0); // Reset sub-tab when main tab changes
          }}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Orders" />
          <Tab label="Users" />
          <Tab label="Payments" />
          <Tab label="Staff Management" icon={<StaffIcon />} />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <OrdersTable
              orders={data.orders}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          </Box>
        )}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <UsersTable users={data.users} />
          </Box>
        )}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <PaymentsTable payments={data.payments} />
          </Box>
        )}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Tabs
              value={subTabValue}
              onChange={(e, newValue) => setSubTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="Assign Task" />
              <Tab label="Task Management" icon={<TaskIcon />} />
              <Tab label="Leave Approval" />
              <Tab label="Attendance Report" />
            </Tabs>
            {subTabValue === 0 && <AssignTask />}
            {subTabValue === 1 && <TaskManagement />}
            {subTabValue === 2 && <LeaveApproval />}
            {subTabValue === 3 && <AttendanceReport />}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;