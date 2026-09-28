import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
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
  Button,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  LinearProgress,
  Stack,
  Container,
} from "@mui/material";
import {
  Person as UserIcon,
  ShoppingCart,
  Payment as PaymentIcon,
  Assessment as StatsIcon,
  Feedback as FeedbackIcon,
  SupervisedUserCircle as StaffIcon,
  Task as TaskIcon,
  Inventory as InventoryIcon,
  MenuBook as MenuBookIcon,
  Logout as LogoutIcon,
  AccessTime as TimerIcon,
  Shield as ShieldIcon,
  Refresh as RefreshIcon,
  WarningAmber as WarningIcon,
  OpenInNew as OpenInNewIcon,
  AssignmentInd as AssignTaskIcon,
  EventAvailable as AttendanceIcon,
  EventBusy as LeaveIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import api from "../../../services/api";
import OrdersTable from "../components/OrdersTable";
import UsersTable from "../components/UsersTable";
import PaymentsTable from "../components/PaymentsTable";
import AssignTask from "../staffManagement/AssignTask";
import LeaveApproval from "../staffManagement/LeaveApproval";
import AttendanceReport from "../staffManagement/AttendanceReport";
import TaskManagement from "../staffManagement/TaskManagement";
import jsPDF from "jspdf";
import "jspdf-autotable";

// 1 Hour Session Inactivity Timeout (3600 seconds)
const SESSION_TIMEOUT_SECONDS = 3600;
const WARNING_THRESHOLD_SECONDS = 300; // 5 minutes warning

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [subTabValue, setSubTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // Session Timeout State (1 Hour)
  const [timeLeft, setTimeLeft] = useState(SESSION_TIMEOUT_SECONDS);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const lastActivityRef = useRef(Date.now());

  // 1-Hour Inactivity Activity Listener
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setTimeLeft(SESSION_TIMEOUT_SECONDS);
    setShowTimeoutWarning(false);
  }, []);

  // Listen to user interactions to refresh the 1-hour idle timer
  useEffect(() => {
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle activity updates to once every 5 seconds
      if (now - lastActivityRef.current > 5000) {
        lastActivityRef.current = now;
      }
    };

    const trackedEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    trackedEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    return () => {
      trackedEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
    };
  }, []);

  // Countdown timer interval
  useEffect(() => {
    const timerInterval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastActivityRef.current) / 1000);
      const remainingSeconds = Math.max(0, SESSION_TIMEOUT_SECONDS - elapsedSeconds);

      setTimeLeft(remainingSeconds);

      // Trigger warning when 5 minutes or less remain
      if (remainingSeconds <= WARNING_THRESHOLD_SECONDS && remainingSeconds > 0) {
        setShowTimeoutWarning(true);
      } else if (remainingSeconds > WARNING_THRESHOLD_SECONDS) {
        setShowTimeoutWarning(false);
      }

      // Automatically sign out when 1 hour expires
      if (remainingSeconds === 0) {
        clearInterval(timerInterval);
        handleAutomaticTimeoutLogout();
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const handleAutomaticTimeoutLogout = () => {
    logout();
    navigate("/login?expired=true");
  };

  const handleManualLogout = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate("/login");
  };

  const handleExtendSession = async () => {
    resetInactivityTimer();
    try {
      await api.get("/auth/me");
    } catch (err) {
      console.warn("Session validation ping:", err);
    }
  };

  // Format seconds into MM:SS or HH:MM:SS
  const formatSessionTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins.toString().padStart(2, "0")}m`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
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
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      fetchDashboardData(true);
    } catch (err) {
      console.error("Error updating order status:", err);
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
    const tableRows = data.users.map((u) => [
      u.name,
      u.email,
      u.role,
      new Date(u.createdAt).toLocaleDateString(),
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
      headStyles: { fillColor: [27, 42, 61], textColor: 255 },
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
      headStyles: { fillColor: [27, 42, 61], textColor: 255 },
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
      headStyles: { fillColor: [27, 42, 61], textColor: 255 },
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
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        sx={{
          bgcolor: "#F8FAFC",
          background: "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #F1F5F9 100%)",
        }}
      >
        <CircularProgress size={56} sx={{ color: "#1B2A3D", mb: 2 }} thickness={4} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1B2A3D" }}>
          Initializing Admin Portal...
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
          Verifying security privileges and loading live metrics
        </Typography>
      </Box>
    );
  }

  // Session Timeout Chip styling
  const isTimeCritical = timeLeft <= WARNING_THRESHOLD_SECONDS;
  const isTimeWarning = timeLeft <= 900 && !isTimeCritical;

  const timerColorConfig = isTimeCritical
    ? { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5", dot: "#EF4444" }
    : isTimeWarning
    ? { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", dot: "#F59E0B" }
    : { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", dot: "#22C55E" };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        color: "#1E293B",
      }}
    >
      {/* ==================== EXECUTIVE TOP BAR ==================== */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
          px: { xs: 2, sm: 3, lg: 4 },
          py: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          {/* Left: Branding & Status */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: "#1B2A3D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(27, 42, 61, 0.2)",
                border: "1px solid rgba(201, 169, 97, 0.4)",
              }}
            >
              <ShieldIcon sx={{ color: "#C9A961", fontSize: 26 }} />
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: "-0.3px",
                    color: "#0F172A",
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    lineHeight: 1.2,
                  }}
                >
                  Admin Portal
                </Typography>
                <Chip
                  label="SECURE 1H"
                  size="small"
                  sx={{
                    bgcolor: "rgba(201, 169, 97, 0.15)",
                    color: "#8B6F30",
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    height: 20,
                    borderRadius: "6px",
                    border: "1px solid rgba(201, 169, 97, 0.3)",
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{ color: "#64748B", display: "flex", alignItems: "center", gap: 0.8 }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: "#10B981",
                    display: "inline-block",
                    boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)",
                  }}
                />
                Operational • TLS 1.3 Certified
              </Typography>
            </Box>
          </Box>

          {/* Right: Security Session Indicator, Refresh, Admin Profile & Logout Button */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 }, flexWrap: "wrap" }}>
            {/* 1-Hour Session Countdown Pill */}
            <Tooltip
              title="Admin Session Timeout: Inactivity limit set to 1 hour. Any mouse or keyboard interaction extends your session."
              arrow
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: timerColorConfig.bg,
                  color: timerColorConfig.text,
                  border: `1px solid ${timerColorConfig.border}`,
                  borderRadius: "24px",
                  px: 1.8,
                  py: 0.6,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  },
                }}
                onClick={handleExtendSession}
              >
                <TimerIcon sx={{ fontSize: 18, color: timerColorConfig.text }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, fontSize: "0.82rem", fontFamily: "monospace" }}
                >
                  {formatSessionTime(timeLeft)}
                </Typography>
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: timerColorConfig.dot,
                  }}
                />
              </Box>
            </Tooltip>

            {/* Quick Data Refresh */}
            <Tooltip title="Refresh Dashboard Data" arrow>
              <IconButton
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                sx={{
                  bgcolor: "#F1F5F9",
                  color: "#475569",
                  border: "1px solid #E2E8F0",
                  width: 38,
                  height: 38,
                  "&:hover": { bgcolor: "#E2E8F0", color: "#1E293B" },
                }}
              >
                <RefreshIcon
                  sx={{
                    fontSize: 20,
                    animation: refreshing ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ my: 1, borderColor: "#E2E8F0" }} />

            {/* Admin Profile Chip */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                px: 1.2,
                py: 0.5,
                borderRadius: "24px",
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
              }}
            >
              <Avatar
                src={user?.avatar || ""}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#1B2A3D",
                  color: "#C9A961",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  border: "1.5px solid #C9A961",
                }}
              >
                {(user?.name || "A").charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "left" }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#0F172A", lineHeight: 1.1, fontSize: "0.85rem" }}
                >
                  {user?.name || "Administrator"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.72rem" }}>
                  Super Admin
                </Typography>
              </Box>
            </Box>

            {/* Logout Button */}
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={() => setLogoutDialogOpen(true)}
              sx={{
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "0.85rem",
                px: 2,
                py: 0.7,
                borderColor: "#FCA5A5",
                color: "#DC2626",
                bgcolor: "#FEF2F2",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#FEE2E2",
                  borderColor: "#EF4444",
                  boxShadow: "0 2px 8px rgba(239, 68, 68, 0.15)",
                },
              }}
            >
              Sign Out
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ==================== MAIN CONTENT CONTAINER ==================== */}
      <Container maxWidth="xl" sx={{ py: 3, flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
        {error && (
          <Alert
            severity="error"
            variant="filled"
            onClose={() => setError("")}
            sx={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)",
            }}
          >
            {error}
          </Alert>
        )}

        {/* ==================== METRIC / STATS CARDS ==================== */}
        <Grid container spacing={2.5}>
          {/* Card 1: Total Users */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid rgba(226, 232, 240, 0.9)",
                bgcolor: "#FFFFFF",
                boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px -4px rgba(37, 99, 235, 0.12)",
                  borderColor: "#93C5FD",
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  bgcolor: "#3B82F6",
                }}
              />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "#64748B",
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                    }}
                  >
                    Total Users
                  </Typography>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "12px",
                      bgcolor: "#EFF6FF",
                      color: "#2563EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UserIcon sx={{ fontSize: 24 }} />
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "#0F172A",
                    fontSize: "2.1rem",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {data.stats.totalUsers.toLocaleString()}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.2 }}>
                  <Chip
                    label="Active Base"
                    size="small"
                    sx={{
                      bgcolor: "#EFF6FF",
                      color: "#1D4ED8",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 22,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    Registered platform accounts
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Total Orders */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid rgba(226, 232, 240, 0.9)",
                bgcolor: "#FFFFFF",
                boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px -4px rgba(16, 185, 129, 0.12)",
                  borderColor: "#86EFAC",
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  bgcolor: "#10B981",
                }}
              />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "#64748B",
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                    }}
                  >
                    Total Orders
                  </Typography>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "12px",
                      bgcolor: "#ECFDF5",
                      color: "#059669",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ShoppingCart sx={{ fontSize: 24 }} />
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "#0F172A",
                    fontSize: "2.1rem",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {data.stats.totalOrders.toLocaleString()}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.2 }}>
                  <Chip
                    label="All Time"
                    size="small"
                    sx={{
                      bgcolor: "#ECFDF5",
                      color: "#047857",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 22,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    Completed & active orders
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Total Revenue */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid rgba(226, 232, 240, 0.9)",
                bgcolor: "#FFFFFF",
                boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px -4px rgba(201, 169, 97, 0.2)",
                  borderColor: "#FDE68A",
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  bgcolor: "#C9A961",
                }}
              />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "#64748B",
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                    }}
                  >
                    Total Revenue
                  </Typography>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "12px",
                      bgcolor: "#FEF3C7",
                      color: "#D97706",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PaymentIcon sx={{ fontSize: 24 }} />
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "#0F172A",
                    fontSize: "2.1rem",
                    letterSpacing: "-0.5px",
                  }}
                >
                  ${Number(data.stats.totalRevenue).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.2 }}>
                  <Chip
                    label="Processed"
                    size="small"
                    sx={{
                      bgcolor: "#FEF3C7",
                      color: "#B45309",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 22,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    Verified payment transactions
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 4: Pending Orders */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid rgba(226, 232, 240, 0.9)",
                bgcolor: "#FFFFFF",
                boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px -4px rgba(239, 68, 68, 0.12)",
                  borderColor: "#FCA5A5",
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  bgcolor: "#EF4444",
                }}
              />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "#64748B",
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                    }}
                  >
                    Pending Orders
                  </Typography>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "12px",
                      bgcolor: "#FEF2F2",
                      color: "#DC2626",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <StatsIcon sx={{ fontSize: 24 }} />
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "#0F172A",
                    fontSize: "2.1rem",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {data.stats.pendingOrders.toLocaleString()}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.2 }}>
                  <Chip
                    label={data.stats.pendingOrders > 0 ? "Requires Action" : "Clear"}
                    size="small"
                    sx={{
                      bgcolor: data.stats.pendingOrders > 0 ? "#FEF2F2" : "#F0FDF4",
                      color: data.stats.pendingOrders > 0 ? "#B91C1C" : "#15803D",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 22,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    {data.stats.pendingOrders > 0 ? "Awaiting processing" : "All orders caught up"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ==================== WORKSPACE / TABS CARD ==================== */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "18px",
            border: "1px solid rgba(226, 232, 240, 0.9)",
            bgcolor: "#FFFFFF",
            boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {/* Main Navigation Pill Bar */}
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              pt: 2,
              pb: 1.5,
              borderBottom: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => {
                setTabValue(newValue);
                setSubTabValue(0);
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 44,
                "& .MuiTabs-indicator": {
                  display: "none",
                },
                "& .MuiTab-root": {
                  minHeight: 42,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  borderRadius: "10px",
                  px: 2.2,
                  py: 0.8,
                  mr: 1,
                  color: "#64748B",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#1E293B",
                    bgcolor: "#F1F5F9",
                  },
                  "&.Mui-selected": {
                    color: "#FFFFFF",
                    bgcolor: "#1B2A3D",
                    boxShadow: "0 4px 12px rgba(27, 42, 61, 0.25)",
                  },
                },
              }}
            >
              <Tab
                label={`Orders (${data.orders.length})`}
                icon={<ShoppingCart sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                label={`Users (${data.users.length})`}
                icon={<UserIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                label={`Payments (${data.payments.length})`}
                icon={<PaymentIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                label="Packages"
                icon={<InventoryIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                onClick={() => navigate("/admin/package")}
              />
              <Tab
                label="Bookings"
                icon={<MenuBookIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                onClick={() => navigate("/admin/booking")}
              />
              <Tab
                label="Feedback"
                icon={<FeedbackIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                onClick={() => navigate("/admin/feedback")}
              />
              <Tab
                label="Staff Management"
                icon={<StaffIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Tab Content Canvas */}
          <Box sx={{ p: { xs: 2, sm: 3 }, flex: 1 }}>
            {/* Tab 0: Orders */}
            {tabValue === 0 && (
              <Box>
                <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.15rem" }}>
                      Orders Directory & Logistics
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748B" }}>
                      Track customer orders, update shipment statuses, and export PDF summaries.
                    </Typography>
                  </Box>
                </Box>
                <OrdersTable
                  orders={data.orders}
                  onUpdateStatus={handleUpdateStatus}
                  onExportPdf={generateOrdersPdfReport}
                />
              </Box>
            )}

            {/* Tab 1: Users */}
            {tabValue === 1 && (
              <Box>
                <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.15rem" }}>
                      User Accounts & Privilege Governance
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748B" }}>
                      Manage role assignments with step-up MFA verification, invite team members, and audit access.
                    </Typography>
                  </Box>
                </Box>
                <UsersTable
                  users={data.users}
                  onExportPdf={generateUsersPdfReport}
                  onRefresh={() => fetchDashboardData(true)}
                />
              </Box>
            )}

            {/* Tab 2: Payments */}
            {tabValue === 2 && (
              <Box>
                <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.15rem" }}>
                      Payment Transactions & Audit Trail
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748B" }}>
                      View verified gateway payments, customer transaction details, and financial logs.
                    </Typography>
                  </Box>
                </Box>
                <PaymentsTable
                  payments={data.payments}
                  onExportPdf={generatePaymentsPdfReport}
                />
              </Box>
            )}

            {/* Tab 3: Package navigation fallback */}
            {tabValue === 3 && (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <InventoryIcon sx={{ fontSize: 48, color: "#64748B", mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Navigating to Package Management...
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/admin/package")}
                  sx={{ mt: 2, bgcolor: "#1B2A3D", textTransform: "none", borderRadius: "8px" }}
                >
                  Open Packages
                </Button>
              </Box>
            )}

            {/* Tab 4: Booking navigation fallback */}
            {tabValue === 4 && (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <MenuBookIcon sx={{ fontSize: 48, color: "#64748B", mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Navigating to Booking Management...
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/admin/booking")}
                  sx={{ mt: 2, bgcolor: "#1B2A3D", textTransform: "none", borderRadius: "8px" }}
                >
                  Open Bookings
                </Button>
              </Box>
            )}

            {/* Tab 5: Feedback navigation fallback */}
            {tabValue === 5 && (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <FeedbackIcon sx={{ fontSize: 48, color: "#64748B", mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Navigating to Customer Feedback...
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/admin/feedback")}
                  sx={{ mt: 2, bgcolor: "#1B2A3D", textTransform: "none", borderRadius: "8px" }}
                >
                  Open Feedback
                </Button>
              </Box>
            )}

            {/* Tab 6: Staff Management Sub-tabs */}
            {tabValue === 6 && (
              <Box>
                <Box
                  sx={{
                    mb: 3,
                    p: 1.5,
                    bgcolor: "#F8FAFC",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <Tabs
                    value={subTabValue}
                    onChange={(e, newValue) => setSubTabValue(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      minHeight: 38,
                      "& .MuiTabs-indicator": { display: "none" },
                      "& .MuiTab-root": {
                        minHeight: 36,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        borderRadius: "8px",
                        px: 2,
                        py: 0.6,
                        mr: 1,
                        color: "#475569",
                        "&:hover": { bgcolor: "#E2E8F0" },
                        "&.Mui-selected": {
                          color: "#1B2A3D",
                          bgcolor: "#FFFFFF",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                          border: "1px solid #CBD5E1",
                        },
                      },
                    }}
                  >
                    <Tab label="Assign Task" icon={<AssignTaskIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                    <Tab label="Task Management" icon={<TaskIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                    <Tab label="Leave Approval" icon={<LeaveIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                    <Tab label="Attendance Report" icon={<AttendanceIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                  </Tabs>
                </Box>

                <Box sx={{ mt: 2 }}>
                  {subTabValue === 0 && <AssignTask />}
                  {subTabValue === 1 && <TaskManagement />}
                  {subTabValue === 2 && <LeaveApproval />}
                  {subTabValue === 3 && <AttendanceReport />}
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* ==================== LOGOUT CONFIRMATION MODAL ==================== */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1,
            width: "100%",
            maxWidth: 420,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "#FEF2F2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.15rem" }}>
            Sign Out of Admin Portal
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <DialogContentText sx={{ color: "#475569", fontSize: "0.92rem" }}>
            Are you sure you want to end your administrative session? You will need to log in again to access security and management controls.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            variant="outlined"
            sx={{
              color: "#475569",
              borderColor: "#CBD5E1",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { borderColor: "#94A3B8", bgcolor: "#F8FAFC" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleManualLogout}
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            sx={{
              bgcolor: "#DC2626",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              "&:hover": { bgcolor: "#B91C1C" },
            }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== 1-HOUR TIMEOUT WARNING MODAL ==================== */}
      <Dialog
        open={showTimeoutWarning}
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1.5,
            width: "100%",
            maxWidth: 440,
            border: "2px solid #FDE68A",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: "#FFFBEB",
              color: "#D97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WarningIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#92400E", fontSize: "1.1rem" }}>
              Session Expiring Soon
            </Typography>
            <Typography variant="caption" sx={{ color: "#B45309" }}>
              1-Hour Security Timeout Policy
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 1.5 }}>
          <DialogContentText sx={{ color: "#475569", fontSize: "0.92rem", mb: 2 }}>
            Your admin session will automatically expire in{" "}
            <strong style={{ color: "#DC2626", fontSize: "1.05rem" }}>
              {formatSessionTime(timeLeft)}
            </strong>{" "}
            due to inactivity. For security compliance, please extend your session if you are still working.
          </DialogContentText>
          <LinearProgress
            variant="determinate"
            value={(timeLeft / WARNING_THRESHOLD_SECONDS) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "#F1F5F9",
              "& .MuiLinearProgress-bar": {
                bgcolor: timeLeft < 60 ? "#EF4444" : "#F59E0B",
                borderRadius: 4,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={handleManualLogout}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              color: "#64748B",
              borderColor: "#CBD5E1",
              fontWeight: 600,
            }}
          >
            Sign Out Now
          </Button>
          <Button
            onClick={handleExtendSession}
            variant="contained"
            sx={{
              bgcolor: "#1B2A3D",
              color: "#FFFFFF",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": { bgcolor: "#243648" },
            }}
          >
            Stay Logged In (Extend 1h)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPage;