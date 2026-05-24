import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
  MenuItem,
  IconButton,
  useTheme,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as ServiceIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  EventAvailable as DateIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import api from '../../services/api';
import StripePayment from '../../components/Payment/StripePayment';

const validateZipCode = (country, zipCode) => {
  const patterns = {
    'India': /^[1-9][0-9]{5}$/,
    'Sri Lanka': /^[1-9][0-9]{4}$/
  };
  return patterns[country]?.test(zipCode) || false;
};

const OrderForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [step, setStep] = useState('order');

  const [orderData, setOrderData] = useState({
    items: [
      {
        product: '',
        quantity: 1,
        price: 0,
        additionalDetails: {
          deceasedName: '',
          serviceDate: new Date(),
          serviceType: 'traditional',
          specialRequests: '',
          attendees: 0
        }
      }
    ],
    paymentMethod: 'credit_card',
    serviceLocation: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    contactPerson: {
      name: '',
      phone: '',
      relationship: '',
      email: ''
    },
    status: 'pending',
    totalAmount: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.map(product => ({
        ...product,
        name: mapProductToServiceName(product.name),
        description: mapProductToServiceDescription(product.description)
      })));
    } catch (error) {
      console.error('Error fetching funeral packages:', error);
      setError('Failed to load funeral packages');
    }
  };

  const mapProductToServiceName = (productName) => {
    const serviceNames = {
      'Product A': 'Basic Memorial Service',
      'Product B': 'Traditional Funeral Service',
      'Product C': 'Premium Funeral Package',
    };
    return serviceNames[productName] || productName;
  };

  const mapProductToServiceDescription = (description) => {
    const serviceDescriptions = {
      'Description A': 'Basic memorial service with essential arrangements',
      'Description B': 'Traditional funeral service with standard amenities',
      'Description C': 'Premium package with complete funeral arrangements',
    };
    return serviceDescriptions[description] || description;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    const isValidZip = validateZipCode(
      orderData.serviceLocation.country,
      orderData.serviceLocation.postalCode
    );

    if (!isValidZip) {
      setError(`Invalid postal code for ${orderData.serviceLocation.country}`);
      return;
    }

    if (!orderData.items[0].product) {
      setError('Please select a funeral service package');
      return;
    }

    if (!orderData.contactPerson.name || !orderData.contactPerson.phone) {
      setError('Please provide contact person name and phone number');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        ...orderData,
        totalAmount: calculateTotal(),
        status: 'pending',
        items: orderData.items.map(item => ({
          ...item,
          serviceDetails: item.additionalDetails
        }))
      };

      const response = await api.post('/orders', orderPayload);
      setOrderId(response.data._id);
      setStep('payment');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create funeral service order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate('/order-confirmation/' + orderId);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderData.items];
    if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value);
      newItems[index] = {
        ...newItems[index],
        product: value,
        price: selectedProduct?.price || 0
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setOrderData({ ...orderData, items: newItems });
  };

  const handleAddressChange = (field, value) => {
    if (field === 'postalCode') {
      const isValid = validateZipCode(orderData.serviceLocation.country, value);
      setError(isValid ? '' : `Invalid ${orderData.serviceLocation.country} postal code`);
    }
    
    setOrderData({
      ...orderData,
      serviceLocation: {
        ...orderData.serviceLocation,
        [field]: value
      }
    });
  };

  const handleAddItem = () => {
    setOrderData({
      ...orderData,
      items: [
        ...orderData.items,
        {
          product: '',
          quantity: 1,
          price: 0
        }
      ]
    });
  };

  const handleQuantityChange = (index, change) => {
    const newItems = [...orderData.items];
    const newQuantity = Math.max(1, newItems[index].quantity + change);
    newItems[index] = { ...newItems[index], quantity: newQuantity };
    setOrderData({ ...orderData, items: newItems });
  };

  const handleRemoveItem = (index) => {
    if (orderData.items.length > 1) {
      const newItems = orderData.items.filter((_, i) => i !== index);
      setOrderData({ ...orderData, items: newItems });
    }
  };

  const calculateTotal = () => {
    return orderData.items.reduce((total, item) => {
      const product = products.find(p => p._id === item.product);
      const price = product ? product.price : 0;
      return total + (price * item.quantity);
    }, 0);
  };

  if (step === 'payment' && orderId) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Complete Payment
            </Typography>
            <Divider sx={{ my: 2 }} />
            <StripePayment
              orderId={orderId}
              amount={calculateTotal()}
              onSuccess={handlePaymentSuccess}
            />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: theme.palette.grey[100],
        p: { xs: 2, md: 4 },
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Card
        sx={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          margin: '0',
          borderRadius: { xs: 2, md: 0 },
          boxShadow: theme.shadows[10],
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <CardContent 
          sx={{ 
            p: { xs: 2, md: 4 },
            height: '100%',
            '&:last-child': { pb: { xs: 3, md: 4 } },
            overflow: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ServiceIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Funeral Service Arrangement
              </Typography>
            </Box>
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <HomeIcon />
            </IconButton>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handlePlaceOrder}>
            <Typography variant="h6" sx={{ mb: 2 }}>Service Details</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Service Package"
                  value={orderData.items[0].product}
                  onChange={(e) => {
                    const newItems = [...orderData.items];
                    newItems[0] = { ...newItems[0], product: e.target.value };
                    setOrderData({ ...orderData, items: newItems });
                  }}
                >
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.name} - ${product.price}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Deceased's Name"
                  value={orderData.items[0].additionalDetails.deceasedName}
                  onChange={(e) => {
                    const newItems = [...orderData.items];
                    newItems[0].additionalDetails.deceasedName = e.target.value;
                    setOrderData({ ...orderData, items: newItems });
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Service Date & Time"
                  value={orderData.items[0].additionalDetails.serviceDate}
                  onChange={(newValue) => {
                    const newItems = [...orderData.items];
                    newItems[0].additionalDetails.serviceDate = newValue;
                    setOrderData({ ...orderData, items: newItems });
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Special Requests"
                  value={orderData.items[0].additionalDetails.specialRequests}
                  onChange={(e) => {
                    const newItems = [...orderData.items];
                    newItems[0].additionalDetails.specialRequests = e.target.value;
                    setOrderData({ ...orderData, items: newItems });
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>Service Location</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Street Address"
                  value={orderData.serviceLocation.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="City"
                  value={orderData.serviceLocation.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="State"
                  value={orderData.serviceLocation.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Country"
                  value={orderData.serviceLocation.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                >
                  <MenuItem value="India">India</MenuItem>
                  <MenuItem value="Sri Lanka">Sri Lanka</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Postal Code"
                  value={orderData.serviceLocation.postalCode}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  error={Boolean(error)}
                  helperText={error || (orderData.serviceLocation.country === 'India' ? 'Enter 6-digit PIN code' : 'Enter 5-digit postal code')}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>Contact Person</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Contact Person Name"
                  value={orderData.contactPerson.name}
                  onChange={(e) => setOrderData({
                    ...orderData,
                    contactPerson: { ...orderData.contactPerson, name: e.target.value }
                  })}
                  error={!orderData.contactPerson.name && error}
                  helperText={!orderData.contactPerson.name && error ? 'Contact name is required' : ''}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Phone Number"
                  value={orderData.contactPerson.phone}
                  onChange={(e) => setOrderData({
                    ...orderData,
                    contactPerson: { ...orderData.contactPerson, phone: e.target.value }
                  })}
                  error={!orderData.contactPerson.phone && error}
                  helperText={!orderData.contactPerson.phone && error ? 'Phone number is required' : ''}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={orderData.contactPerson.email}
                  onChange={(e) => setOrderData({
                    ...orderData,
                    contactPerson: { ...orderData.contactPerson, email: e.target.value }
                  })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Relationship to Deceased"
                  value={orderData.contactPerson.relationship}
                  onChange={(e) => setOrderData({
                    ...orderData,
                    contactPerson: { ...orderData.contactPerson, relationship: e.target.value }
                  })}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">
                Total: ${calculateTotal().toFixed(2)}
              </Typography>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<ServiceIcon />}
                sx={{ py: 1.5, px: 4, borderRadius: 2, fontWeight: 'bold' }}
              >
                Proceed to Payment
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderForm; 