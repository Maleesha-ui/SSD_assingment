const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
require('./models/Product');
require('./models/User'); 
require('./models/Staff');
const routerInventory = require("./routes/InventoryRoutes");
const routerSupplier = require("./routes/SupplierRoutes");
const routerInventoryOrder = require("./routes/InventoryOrderRoutes");

const driverRoutes = require('./routes/DriverRoutes');
const vehicleRoutes = require('./routes/VehicleRoutes');
const assignmentsRoutes = require('./routes/AssignmentRoutes')
const routeRoutes = require('./routes/RouteRoutes');
const maintenanceRoutes = require("./routes/MaintenanceRoutes");



// Load env vars
dotenv.config();

// Passport & Session
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);

// Connect to database
connectDB();

const app = express();

// Middleware
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
  origin: [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Session middleware for OAuth state verification
app.use(session({
  secret: process.env.SESSION_SECRET || 'funeral_mgmt_session_secret_key_2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
try {
  console.log('Registering routes...');
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/products', require('./routes/productRoutes'));
  app.use('/api/payments', require('./routes/paymentRoutes'));
  app.use('/api/sales', require('./routes/salesRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/reports', require('./routes/reportRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/feedback', require('./routes/feedbackRoutes'));
  app.use('/api/staff', require('./routes/staffRoutes'));
  app.use('/api/public', require('./routes/publicRoutes'));

  app.use("/drivers",driverRoutes);
  app.use("/vehicles",vehicleRoutes);
  app.use("/assignments",assignmentsRoutes);
  app.use("/routes", routeRoutes);
  app.use("/maintenance", maintenanceRoutes);

  app.use("/inventory", routerInventory);
  app.use("/supplier", routerSupplier);
  app.use("/inventoryorder", routerInventoryOrder);
  console.log('Routes registered successfully');
} catch (error) {
  console.error('Error loading routes:', error);
}

// Error handler
app.use(require('./middleware/errorHandler'));

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});