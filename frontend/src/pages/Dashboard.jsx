import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  useTheme, 
  Button, 
  Card, 
  CardContent, 
  CardMedia,
  CircularProgress,
  Container,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  History as HistoryIcon,
  Person as ProfileIcon,
  Info as AboutIcon,
  Assignment as PackagesIcon,
  MedicalServices as ServicesIcon,
  Person,
  Favorite as SupportIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Header from '../components/Header';

// Funeral & Memorial Services Photography (Direct Unsplash URLs)
const mainImage1 = "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=80";
const mainImage2 = "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=1200&q=80";
const service1 = "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&q=80";
const service2 = "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=80";
const service3 = "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&q=80";
const service4 = "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&q=80";
const service5 = "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=600&q=80";
const service6 = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80";

const DashboardCard = ({ title, icon, value, onClick, color = 'primary' }) => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        p: 3,
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderLeft: '4px solid #C9A961',
        border: '1px solid rgba(27, 42, 61, 0.06)',
        borderLeftWidth: '4px',
        background: '#ffffff',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(27, 42, 61, 0.05)',
        '&:hover': { 
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 28px rgba(27, 42, 61, 0.12)',
          borderColor: 'rgba(201, 169, 97, 0.4)',
          borderLeftColor: '#C9A961',
          '& .icon': {
            color: '#C9A961',
            transform: 'scale(1.08)'
          }
        },
        display: 'flex',
        flexDirection: 'column'
      }}
      elevation={0}
      onClick={onClick}
    >
      <Box className="icon" sx={{ 
        color: '#1B2A3D',
        mb: 2,
        transition: 'all 0.3s ease'
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 40 } })}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: '#1B2A3D', fontFamily: '"Playfair Display", serif' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#5A6C7D' }}>
        {value}
      </Typography>
    </Paper>
  );
};

const ServiceCard = ({ image, title, description, onClick }) => {
  const theme = useTheme();
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        '&:hover': { 
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[6],
          '& .cardMedia': {
            transform: 'scale(1.05)'
          }
        },
        cursor: 'pointer',
        borderRadius: 2
      }}
      elevation={2}
      onClick={onClick}
    >
      <CardMedia
        className="cardMedia"
        component="img"
        height="160"
        image={image}
        alt={title}
        sx={{ 
          objectFit: 'cover',
          transition: 'transform 0.5s ease'
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const PackageCard = ({ name, price, description, services, image }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[6],
          '& .cardMedia': {
            transform: 'scale(1.05)'
          }
        },
        borderRadius: 2
      }}
      elevation={2}
    >
      <CardMedia
        className="cardMedia"
        component="img"
        height="160"
        image={image}
        alt={name}
        sx={{ 
          objectFit: 'cover',
          transition: 'transform 0.5s ease'
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&q=80";
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
            {name}
          </Typography>
          <Chip 
            label={`Rs. ${price}`} 
            color="primary" 
            size="small"
            sx={{ fontWeight: 'medium' }} 
          />
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
        {services && services.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Includes:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {services.map((service, index) => (
                <Chip 
                  key={index}
                  label={service}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderRadius: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await api.get('/public/packages');
        console.log('Packages data:', response.data);
        setPackages(response.data);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPackages();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleServiceClick = (service) => {
    // Handle service click
    console.log(`Service clicked: ${service}`);
    // Potentially navigate or show more details
  };

  const renderDashboardContent = () => (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Paper sx={{ 
        p: { xs: 3, sm: 4 }, 
        mb: 4, 
        borderRadius: 3, 
        background: 'linear-gradient(135deg, #1B2A3D 0%, #243648 100%)',
        color: '#ffffff',
        boxShadow: '0 8px 24px rgba(27, 42, 61, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar sx={{ bgcolor: '#C9A961', color: '#1B2A3D', width: 60, height: 60, boxShadow: '0 4px 12px rgba(201, 169, 97, 0.35)' }}>
            <Person sx={{ fontSize: 34 }} />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ color: '#C9A961', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
              Welcome back
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#ffffff', fontFamily: '"Playfair Display", serif', mt: 0.2 }}>
              {user?.name || 'Valued Client'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
              Eternal Rest Memorial Services — Here to support you with compassion and dignity.
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
        Quick Actions
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Create Order"
            icon={<OrderIcon />}
            value="Arrange a new service"
            onClick={() => navigate('/order/new')}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Manage Payments"
            icon={<PaymentIcon />}
            value="Review and process payments"
            onClick={() => navigate('/payments')}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Track Services"
            icon={<ShippingIcon />}
            value="Monitor ongoing arrangements"
            onClick={() => navigate('/shipping')}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Service History"
            icon={<HistoryIcon />}
            value="View past arrangements"
            onClick={() => navigate('/orders')}
            color="success"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" sx={{ my: 3, fontWeight: 500 }}>
            Explore Our Services
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="My Profile"
            icon={<ProfileIcon />}
            value="View and edit your information"
            onClick={() => navigate('/profile')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="About Us"
            icon={<AboutIcon />}
            value="Learn about our compassionate service"
            onClick={() => setActiveSection('about')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Funeral Packages"
            icon={<PackagesIcon />}
            value="Browse our comprehensive packages"
            onClick={() => setActiveSection('packages')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Memorial Services"
            icon={<ServicesIcon />}
            value="Explore our remembrance options"
            onClick={() => setActiveSection('services')}
          />
        </Grid>
      </Grid>
    </Container>
  );

  const renderAboutSection = () => (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }} elevation={2}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 500 }}>
            About Eternal Rest Memorial Services
          </Typography>
          <Divider sx={{ width: '80px', margin: '0 auto', my: 3, borderColor: theme.palette.primary.main, borderWidth: 2 }} />
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '800px', margin: '0 auto' }}>
            Providing compassionate support and dignified services during life's most difficult moments
          </Typography>
        </Box>
        
        <Box sx={{ my: 4 }}>
          <img 
            src={mainImage1} 
            alt="Funeral Services" 
            style={{ 
              width: '100%', 
              height: '400px', 
              objectFit: 'cover', 
              borderRadius: '8px'
            }} 
          />
        </Box>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
              Our Commitment to You
            </Typography>
            <Typography variant="body1" paragraph>
              At Eternal Rest, we understand that saying goodbye to a loved one is one of life's most challenging experiences. Our dedicated team provides compassionate guidance and support throughout the entire process, ensuring that each service reflects the unique life being honored.
            </Typography>
            <Typography variant="body1">
              Founded on the principles of dignity, respect, and personalized care, we strive to create meaningful memorial experiences that provide comfort and healing for families during their time of grief.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
              Comprehensive Support Services
            </Typography>
            <Typography variant="body1" paragraph>
              Our support extends beyond the funeral service. We offer grief counseling, assistance with legal documentation, and ongoing remembrance programs to help families navigate the journey of loss.
            </Typography>
            <Typography variant="body1">
              With decades of combined experience, our team approaches each arrangement with sensitivity and attention to detail, allowing you to focus on celebrating and remembering your loved one's life.
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setActiveSection('dashboard')}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            Return to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );

  const renderPackagesSection = () => (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }} elevation={2}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 500 }}>
            Funeral Service Packages
          </Typography>
          <Divider sx={{ width: '80px', margin: '0 auto', my: 3, borderColor: theme.palette.primary.main, borderWidth: 2 }} />
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '800px', margin: '0 auto' }}>
            Thoughtfully designed arrangements to honor your loved one with dignity and respect
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', my: 3, p: 4, bgcolor: 'error.light', borderRadius: 2 }}>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Box>
        ) : packages.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 3, p: 4, bgcolor: 'info.light', borderRadius: 2 }}>
            <Typography>No packages available at this time. Please contact our office for custom arrangements.</Typography>
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {packages.map((pkg) => (
              <Grid item key={pkg._id} xs={12} sm={6} md={4}>
                <PackageCard
                  name={pkg.name}
                  price={pkg.price}
                  description={pkg.description}
                  services={pkg.services || []}
                  image={pkg.image || "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&q=80"}
                />
              </Grid>
            ))}
          </Grid>
        )}
        
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setActiveSection('dashboard')}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: '50px',
              background: 'linear-gradient(135deg, #1B2A3D 0%, #243648 100%)',
              color: '#ffffff',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              boxShadow: '0 4px 14px rgba(27, 42, 61, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #243648 0%, #111D2B 100%)',
              }
            }}
          >
            Return to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );

  const renderServicesSection = () => (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }} elevation={2}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 500 }}>
            Our Memorial Services
          </Typography>
          <Divider sx={{ width: '80px', margin: '0 auto', my: 3, borderColor: theme.palette.primary.main, borderWidth: 2 }} />
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '800px', margin: '0 auto' }}>
            Comprehensive funeral and memorial solutions tailored to your specific needs and traditions
          </Typography>
        </Box>
        
        <Box sx={{ my: 4 }}>
          <img 
            src={mainImage2} 
            alt="Our Services" 
            style={{ 
              width: '100%', 
              height: '400px', 
              objectFit: 'cover', 
              borderRadius: '8px' 
            }} 
          />
        </Box>
        
        <Grid container spacing={4} sx={{ mt: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <ServiceCard
              image={service1}
              title="Traditional Funeral Services"
              description="Complete arrangements for religious and cultural ceremonies with personalized touches to honor your loved one."
              onClick={() => handleServiceClick("traditional")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ServiceCard
              image={service2}
              title="Cremation Services"
              description="Dignified cremation options with various memorial service possibilities to suit your family's preferences."
              onClick={() => handleServiceClick("cremation")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ServiceCard
              image={service3}
              title="Memorial Ceremonies"
              description="Beautiful celebration of life services designed to reflect the unique personality and legacy of your loved one."
              onClick={() => handleServiceClick("memorial")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ServiceCard
              image={service4}
              title="Pre-Planning Services"
              description="Thoughtful planning services that provide peace of mind and reduce the burden on your family during difficult times."
              onClick={() => handleServiceClick("prePlanning")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ServiceCard
              image={service5}
              title="Grief Support & Counseling"
              description="Compassionate resources and professional guidance to help families navigate the journey of loss and healing."
              onClick={() => handleServiceClick("griefSupport")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ServiceCard
              image={service6}
              title="Memorial Keepsakes"
              description="Thoughtful remembrance items and personalized mementos to preserve precious memories of your loved one."
              onClick={() => handleServiceClick("keepsakes")}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setActiveSection('dashboard')}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: '50px',
              background: 'linear-gradient(135deg, #1B2A3D 0%, #243648 100%)',
              color: '#ffffff',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              boxShadow: '0 4px 14px rgba(27, 42, 61, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #243648 0%, #111D2B 100%)',
              }
            }}
          >
            Return to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8F6F3',
        width: '100%',
        position: 'relative',
        pb: 8
      }}
    >
      <Header />
      
      <Container maxWidth="xl">
        {activeSection === 'dashboard' && renderDashboardContent()}
        {activeSection === 'about' && renderAboutSection()}
        {activeSection === 'packages' && renderPackagesSection()}
        {activeSection === 'services' && renderServicesSection()}
      </Container>
    </Box>
  );
};

export default Dashboard;