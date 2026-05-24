import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./components/Layout/DashboardLayout";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import OrderForm from "./pages/orders/OrderForm";
import OrderTracking from "./pages/orders/OrderTracking";
import OrderHistory from "./pages/orders/OrderHistory";
import AdminDashboard from "./pages/admin/dashboard/DashboardPage";
import Payments from "./pages/payments/Payments";
import ShippingTracking from "./pages/shipping/ShippingTracking";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CreateOrder from "./pages/orders/CreateOrder";
import OrderConfirmation from "./pages/orders/OrderConfirmation";

import PaymentPage from "./pages/payments/PaymentPage";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import DriverDashboard from "./pages/driver/DriverDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import ProfilePage from "./pages/profile/ProfilePage";
import FeedbackAdmin from "./pages/admin/feedback/FeedbackAdmin";

import PackageAdmin from "./pages/admin/Package/Package";
import BookingAdmin from "./pages/admin/Booking/Booking";
import AddStaff from "./pages/admin/staffManagement/AddStaff"; // New
import AssignTask from "./pages/admin/staffManagement/AssignTask"; // New
import LeaveApproval from "./pages/admin/staffManagement/LeaveApproval"; // New
import AttendanceReport from "./pages/admin/staffManagement/AttendanceReport"; // New

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Packages from "./pages/Packages";
import PackageDetails from "./pages/PackageDetails";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import FuneralProcedures from "./pages/FuneralProcedures";
import ErrorBoundary from "./components/ErrorBoundary";

import SupplierPage from "./pages/SupplierDetails/SupplierDetails";
import InventoryNavigationBar from "./components/InventoryNavigationBar/InventoryNavigationBar";
import StockDetails from "./pages/StockDetails/StockDetails";
import InventoryOrderDetails from "./pages/InventoryOrderDetails/InventoryOrderDetails";
import InventoryDashboard from "./pages/InventoryDashboard/InventoryDashboard";

import Navbar from "./components/NavbarD";
import DriverRegistration from "./pages/DriverForm/DriverRegistration";
import VehicleManagement from "./pages/VehicleDetails/VehicleManagement";
import DriverManagement from "./pages/DriverDetails/DriverManagement";
import DashboardD from "./pages/DashBoard/Dashboard";
import VehicleRegistration from "./pages/VehicleForm/VehicleRegistration";
import AssignmentManagement from "./pages/Assignments/AssignmentManagement";
import RouteMap from "./pages/Routes/RouteMap";
import MaintenanceManagement from "./pages/Maintenance/MaintenanceManagement";
import MaintenanceRegistration from "./pages/NewMaintenance/MaintenanceRegistration";
import MaintenanceReport from "./pages/Report/MaintenanceReport";
import DriverLayout from "./components/Layout/DriverLayout";

const ProtectedRoute = () => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

const AdminRoute = () => {
  const role = localStorage.getItem("role");
  if (role !== "admin") return <Navigate to="/" />;
  return <Outlet />;
};
const StaffRoute = ({ children }) => {
  const { user } = useAuth();
  if (user.role !== "staff") return <Navigate to="/" />;
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "driver":
      return <DashboardD />;
    case "staff":
      return <StaffDashboard />;
    case "customer":
      return <Dashboard />;
    case "manager":
      return <InventoryDashboard />;
    default:
      return <Dashboard />;
  }
};

// Layout for Public Routes
const PublicLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <BrowserRouter>
            <CssBaseline />

            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                {/* Auth Routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardRouter />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/track/:orderId" element={<OrderTracking />} />
                  <Route path="/shipping" element={<ShippingTracking />} />
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/feedback" element={<FeedbackAdmin />} />
                    <Route path="/admin/package" element={<PackageAdmin />} />
                    <Route
                      path="/admin/staff-management/add-staff"
                      element={<AddStaff />}
                    />
                    <Route
                      path="/admin/staff-management/assign-task"
                      element={<AssignTask />}
                    />
                    <Route
                      path="/admin/staff-management/leave-approval"
                      element={<LeaveApproval />}
                    />
                    <Route
                      path="/admin/staff-management/attendance-report"
                      element={<AttendanceReport />}
                    />
                  </Route>
                </Route>

                <Route path="/ind" element={<InventoryDashboard />} />
                          <Route path="/suppliers" element={<SupplierPage />} />
                          <Route path="/inventory" element={<StockDetails />} />
                          <Route path="/inventory-orders" element={<InventoryOrderDetails />} />

       
      
         
<Route element={<DriverLayout />}>
  <Route path="/driverregistration" element={<DriverRegistration />} />
  <Route path="/vehicleregistration" element={<VehicleRegistration />} />
  <Route path="/dri" element={<DashboardD />} />
  <Route path="/vehiclemanagement" element={<VehicleManagement />} />
  <Route path="/drivermanagement" element={<DriverManagement />} />
  <Route path="/assignmentmanagement" element={<AssignmentManagement />} />
  <Route path="/routes" element={<RouteMap />} />
  <Route path="/maintenancemanagement" element={<MaintenanceManagement />} />
  <Route path="/maintenanceregistration" element={<MaintenanceRegistration />} />
  <Route path="/maintenancereport" element={<MaintenanceReport />} />
</Route>
      

                <Route path="/order/new" element={<OrderForm />} />

                <Route path="/payments" element={<Payments />} />

                <Route path="/admin/booking" element={<BookingAdmin />} />

                <Route path="/create-order" element={<CreateOrder />} />
                <Route
                  path="/order-confirmation/:orderId"
                  element={<OrderConfirmation />}
                />
                <Route path="/payment/:orderId" element={<PaymentPage />} />

                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/packages" element={<Packages />} />
                  <Route path="/package/:name" element={<PackageDetails />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route
                    path="/funeral-procedures"
                    element={<FuneralProcedures />}
                  />
                </Route>
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
