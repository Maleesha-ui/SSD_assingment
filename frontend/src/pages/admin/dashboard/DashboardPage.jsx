import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Typography,
  useTheme,
  Card,
  CardContent,
} from "@mui/material";
import {
  Person as UserIcon,
  ShoppingCart,
  Payment as PaymentIcon,
  Assessment as StatsIcon,
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Feedback as FeedbackIcon,
  SupervisedUserCircle as StaffIcon,
  Task as TaskIcon,
} from "@mui/icons-material";
import InventoryIcon from '@mui/icons-material/Inventory';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import api from "../../../services/api";
import StatsCard from "../components/StatsCard";
import OrdersTable from "../components/OrdersTable";
import UsersTable from "../components/UsersTable";
import PaymentsTable from "../components/PaymentsTable";
import AssignTask from "../staffManagement/AssignTask";
import LeaveApproval from "../staffManagement/LeaveApproval";
import AttendanceReport from "../staffManagement/AttendanceReport";
import TaskManagement from "../staffManagement/TaskManagement";
import jsPDF from "jspdf";
import "jspdf-autotable";

const DashboardPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [subTabValue, setSubTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const theme = useTheme();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [stats, users, orders, payments] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/orders"),
        api.get("/admin/payments"),
      ]);

      setData({
        stats: stats.data,
        users: users.data,
        orders: orders.data,
        payments: payments.data,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      fetchDashboardData();
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status");
    }
  };

  const generateUsersPdfReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Users Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Name", "Email", "Role", "Join Date"];
    const tableRows = data.users.map((user) => [
      user.name,
      user.email,
      user.role,
      new Date(user.createdAt).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save("users_report.pdf");
  };

  const generateOrdersPdfReport = (filteredOrders, filters) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Orders Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    if (filters) {
      doc.setFontSize(10);
      doc.text("Applied Filters:", 14, 40);
      let yPos = 46;

      if (filters.orderStatus !== "all") {
        doc.text(`Order Status: ${filters.orderStatus}`, 20, yPos);
        yPos += 6;
      }
      if (filters.paymentStatus !== "all") {
        doc.text(`Payment Status: ${filters.paymentStatus}`, 20, yPos);
        yPos += 6;
      }
      if (filters.startDate) {
        doc.text(`From: ${filters.startDate}`, 20, yPos);
        yPos += 6;
      }
      if (filters.endDate) {
        doc.text(`To: ${filters.endDate}`, 20, yPos);
        yPos += 6;
      }
      if (filters.search) {
        doc.text(`Search: ${filters.search}`, 20, yPos);
        yPos += 6;
      }
    }

    const tableColumn = [
      "Order Number",
      "Customer",
      "Items",
      "Total Amount",
      "Status",
      "Payment Status",
      "Date",
    ];
    const tableRows = filteredOrders.map((order) => [
      order.orderNumber,
      order.user?.name || "N/A",
      order.items
        .map((item) => `${item.productName} (${item.quantity})`)
        .join(", "),
      `$${order.totalAmount.toFixed(2)}`,
      order.orderStatus,
      order.paymentStatus,
      new Date(order.createdAt).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: filters ? 70 : 40,
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 50 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 },
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save("orders_report.pdf");
  };

  const generatePaymentsPdfReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Payments Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = [
      "Transaction ID",
      "Order Number",
      "Customer",
      "Amount",
      "Method",
      "Status",
      "Date",
    ];
    const tableRows = data.payments.map((payment) => [
      payment.transactionId,
      payment.orderId?.orderNumber || "N/A",
      payment.orderId?.user?.name || "N/A",
      `$${payment.amount.toFixed(2)}`,
      payment.paymentMethod,
      payment.status,
      new Date(payment.createdAt).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 30 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 },
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save("payments_report.pdf");
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        bgcolor: theme.palette.grey[100],
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[1],
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
        >
          Admin Dashboard
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ p: 3, overflow: "auto", height: "calc(100vh - 76px)" }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              sx={{
                bgcolor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                boxShadow: theme.shadows[3],
                height: "100%",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <UserIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Total Users</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                  {data.stats.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card
              sx={{
                bgcolor: theme.palette.success.light,
                color: theme.palette.success.contrastText,
                boxShadow: theme.shadows[3],
                height: "100%",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <ShoppingCart sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Total Orders</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                  {data.stats.totalOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card
              sx={{
                bgcolor: theme.palette.warning.light,
                color: theme.palette.warning.contrastText,
                boxShadow: theme.shadows[3],
                height: "100%",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PaymentIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Total Revenue</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                  ${data.stats.totalRevenue.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card
              sx={{
                bgcolor: theme.palette.info.light,
                color: theme.palette.info.contrastText,
                boxShadow: theme.shadows[3],
                height: "100%",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <StatsIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Pending Orders</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                  {data.stats.pendingOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Table Section */}
        <Paper
          sx={{
            height: "calc(100vh - 250px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 2,
            boxShadow: theme.shadows[3],
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => {
              setTabValue(newValue);
              setSubTabValue(0); // Reset sub-tab when main tab changes
            }}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: theme.palette.background.paper,
              px: 2,
              minHeight: 48,
            }}
          >
            <Tab
              label="Orders"
              icon={<ShoppingCart />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab
              label="Users"
              icon={<UserIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab
              label="Payments"
              icon={<PaymentIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab
              label="Package"
              icon={<InventoryIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
              onClick={() => (window.location.href = "/admin/package")}
            />
            <Tab
              label="Booking"
              icon={<MenuBookIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
              onClick={() => (window.location.href = "/admin/booking")}
            />
            <Tab
              label="Feedback"
              icon={<FeedbackIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
              onClick={() => (window.location.href = "/admin/feedback")}
            />
            <Tab
              label="Staff Management"
              icon={<StaffIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>

          <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {tabValue === 0 && (
              <OrdersTable
                orders={data.orders}
                onUpdateStatus={handleUpdateStatus}
                onExportPdf={generateOrdersPdfReport}
              />
            )}
            {tabValue === 1 && (
              <UsersTable
                users={data.users}
                onExportPdf={generateUsersPdfReport}
              />
            )}
            {tabValue === 2 && (
              <PaymentsTable
                payments={data.payments}
                onExportPdf={generatePaymentsPdfReport}
              />
            )}
            {tabValue === 3 && (
              <Box sx={{ p: 2 }}>
                {/* Package tab redirects to /admin/package */}
              </Box>
            )}
            {tabValue === 4 && (
              <Box sx={{ p: 2 }}>
                {/* Booking tab redirects to /admin/booking */}
              </Box>
            )}
            {tabValue === 5 && (
              <Box sx={{ p: 2 }}>
                {/* Feedback tab redirects to /admin/feedback */}
              </Box>
            )}
            {tabValue === 6 && (
              <Box sx={{ p: 2 }}>
                <Tabs
                  value={subTabValue}
                  onChange={(e, newValue) => setSubTabValue(newValue)}
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: theme.palette.background.paper,
                    mb: 2,
                    minHeight: 48,
                  }}
                >
                  <Tab label="Assign Task" sx={{ minHeight: 48 }} />
                  <Tab label="Task Management" icon={<TaskIcon />} sx={{ minHeight: 48 }} />
                  <Tab label="Leave Approval" sx={{ minHeight: 48 }} />
                  <Tab label="Attendance Report" sx={{ minHeight: 48 }} />
                </Tabs>
                {subTabValue === 0 && <AssignTask />}
                {subTabValue === 1 && <TaskManagement />}
                {subTabValue === 2 && <LeaveApproval />}
                {subTabValue === 3 && <AttendanceReport />}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default DashboardPage;