import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Chip,
  Skeleton,
  Fade,
  Slide
} from '@mui/material';
import { 
  ArrowForward, 
  Star, 
  LocalFlorist, 
  Favorite, 
  EventAvailable, 
  SupportAgent, 
  Church, 
  NaturePeople, 
  CalendarMonth, 
  Psychology,
  Lock
} from '@mui/icons-material';
import "./Home.css"; 
import "./Packages.css";
import "./PackageDetails.css";
import "../components/Header.css"; 
import "../components/Footer.css"; 

import api from "../services/api";
import { useAuth } from '../context/AuthContext';

const Home = ({ onServiceClick = () => {} }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isAuthenticated = !!(user && token);

  const handleRestrictedAction = (destination) => {
    if (isAuthenticated) {
      navigate(destination);
    } else {
      navigate('/login?restricted=true');
    }
  };
  
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

  const features = [
    {
      icon: <LocalFlorist sx={{ fontSize: 36 }} />,
      title: 'Compassionate Care',
      description: 'Dedicated support during difficult times with empathy and understanding'
    },
    {
      icon: <Favorite sx={{ fontSize: 36 }} />,
      title: 'Personalized Services',
      description: 'Tailored arrangements that honor your loved one\'s unique life'
    },
    {
      icon: <EventAvailable sx={{ fontSize: 36 }} />,
      title: '24/7 Availability',
      description: 'Round-the-clock support whenever you need us most'
    },
    {
      icon: <SupportAgent sx={{ fontSize: 36 }} />,
      title: 'Expert Guidance',
      description: 'Experienced professionals to guide you through every step'
    }
  ];

  const services = [
    { icon: <Church sx={{ fontSize: 50 }} />, title: 'Burial Services', desc: 'We offer complete burial services with care and dignity.', click: 'burial' },
    { icon: <NaturePeople sx={{ fontSize: 50 }} />, title: 'Cremation Services', desc: 'Affordable and respectful cremation services.', click: 'cremation' },
    { icon: <Favorite sx={{ fontSize: 50 }} />, title: 'Memorial Services', desc: 'Personalized memorial services to honor your loved ones.', click: 'memorial' },
    { icon: <CalendarMonth sx={{ fontSize: 50 }} />, title: 'Pre-Planning Services', desc: 'Plan ahead to ease the burden on your family.', click: 'prePlanning' },
    { icon: <Psychology sx={{ fontSize: 50 }} />, title: 'Grief Support', desc: 'Compassionate support to help you through difficult times.', click: 'griefSupport' }
  ];

  return (
    <Box className="home-container">
      {/* Hero Section */}
      <Box className="hero-section">
        <Box className="hero-overlay">
          <Container maxWidth="lg" className="hero-content">
            <Fade in={true} timeout={1000}>
              <Box>
                <Typography 
                  variant="h1" 
                  className="hero-title"
                  sx={{ 
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600,
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                    mb: 3
                  }}
                >
                  Honoring Lives with
                  <br />
                  <span className="text-gradient">Dignity & Care</span>
                </Typography>
                <Typography 
                  variant="h5" 
                  className="hero-subtitle"
                  sx={{ 
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    maxWidth: 700,
                    mb: 4,
                    mx: 'auto'
                  }}
                >
                  Compassionate funeral services that celebrate life and provide comfort during difficult times
                </Typography>
                <Box className="hero-buttons">
                  <Button 
                    onClick={() => handleRestrictedAction('/packages')}
                    variant="contained"
                    size="large"
                    endIcon={isAuthenticated ? <ArrowForward /> : <Lock sx={{ fontSize: 18 }} />}
                    className="btn-primary"
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      fontSize: '1.05rem',
                      mr: 2
                    }}
                  >
                    View Packages
                  </Button>
                  <Button 
                    onClick={() => handleRestrictedAction('/contact-us')}
                    variant="outlined"
                    size="large"
                    className="btn-outline"
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      fontSize: '1.05rem',
                      borderColor: 'rgba(255,255,255,0.7)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Contact Us
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Container>
        </Box>
      </Box>

      {/* About Section */}
      <Box className="about-section section">
        <Container maxWidth="lg">
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Slide direction="right" in={true} timeout={1000}>
                <Box>
                  <Typography 
                    variant="h2" 
                    className="section-title"
                    sx={{ 
                      fontFamily: '"Playfair Display", serif',
                      fontWeight: 600,
                      mb: 3
                    }}
                  >
                    We Support You in
                    <br />
                    <span className="text-gradient">Honoring Your Loved Ones</span>
                  </Typography>
                  <Typography 
                    variant="body1" 
                    className="about-text"
                    sx={{ 
                      fontSize: '1.05rem',
                      lineHeight: 1.8,
                      color: '#5A6C7D'
                    }}
                  >
                    At Memorial Services Hub, we are committed to providing compassionate and professional funeral arrangements, ensuring dignity and care in every service we offer. More than just a funeral management service, we stand as a trusted companion during your time of need.
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: '1.05rem',
                      lineHeight: 1.8,
                      color: '#5A6C7D',
                      mt: 2
                    }}
                  >
                    Our support doesn't end with the final farewell. We continue to assist you throughout, offering guidance, comfort, and unwavering support—because honoring a life is more than just a service; it's a heartfelt commitment.
                  </Typography>
                </Box>
              </Slide>
            </Grid>
            <Grid item xs={12} md={6}>
              <Slide direction="left" in={true} timeout={1000}>
                <Box className="about-image">
                  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80" alt="About Us" loading="lazy" />
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box className="features-section section">
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            align="center"
            className="section-title"
            sx={{ 
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              mb: 5
            }}
          >
            Why Choose Us
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in={true} timeout={800 + index * 200}>
                  <Card className="feature-card">
                    <CardContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
                      <Box className="feature-icon" sx={{ color: '#C9A961', mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: '"Playfair Display", serif',
                          fontWeight: 600,
                          mb: 1.5,
                          color: '#1B2A3D',
                          fontSize: '1.1rem'
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#5A6C7D',
                          lineHeight: 1.6,
                          fontSize: '0.9rem'
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Funeral Packages Section */}
      <Box id="packages-section" className="packages-section section">
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            align="center"
            className="section-title"
            sx={{ 
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              mb: 2
            }}
          >
            Our Funeral Packages
          </Typography>
          <Typography 
            variant="body1" 
            align="center"
            sx={{ 
              mb: 5,
              color: '#5A6C7D',
              maxWidth: 600,
              mx: 'auto',
              fontSize: '1.05rem',
              lineHeight: 1.7
            }}
          >
            Choose from our carefully crafted packages designed to meet your needs and budget
          </Typography>
          
          {loading ? (
            <Grid container spacing={4}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} md={4} key={item}>
                  <Card sx={{ border: '1px solid #E8E4DF' }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={40} />
                      <Skeleton variant="text" height={30} />
                      <Skeleton variant="text" height={60} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="error">{error}</Typography>
            </Box>
          ) : packages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="textSecondary">No packages available at this time.</Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {packages.map((pkg, index) => (
                <Grid item xs={12} md={4} key={pkg._id}>
                  <Fade in={true} timeout={600 + index * 200}>
                    <Card 
                      className="package-card"
                      onClick={() => handleRestrictedAction(`/package/${encodeURIComponent(pkg.name)}`)}
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: '0 12px 28px rgba(27, 42, 61, 0.15)'
                        }
                      }}
                    >
                      <CardContent className="package-content">
                        <Box className="package-icon-wrapper">
                          <Box className="package-icon">
                            <Church sx={{ fontSize: 40 }} />
                          </Box>
                        </Box>
                        <Typography 
                          variant="h5" 
                          className="package-title"
                          sx={{ 
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 600,
                            mb: 1,
                            color: '#1B2A3D'
                          }}
                        >
                          {pkg.name}
                        </Typography>
                        <Typography 
                          variant="h4" 
                          className="package-price"
                          sx={{ 
                            color: '#C9A961',
                            fontWeight: 700,
                            mb: 2,
                            fontSize: '1.8rem'
                          }}
                        >
                          Rs.{pkg.price}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          className="package-description"
                          sx={{ 
                            color: '#5A6C7D',
                            mb: 2,
                            lineHeight: 1.6
                          }}
                        >
                          {pkg.description}
                        </Typography>
                        {pkg.services && pkg.services.length > 0 && (
                          <Box className="package-services">
                            {pkg.services.slice(0, 3).map((service, idx) => (
                              <Chip 
                                key={idx} 
                                label={service} 
                                size="small" 
                                className="package-chip"
                              />
                            ))}
                          </Box>
                        )}
                        <Button
                          variant="outlined"
                          fullWidth
                          size="small"
                          endIcon={isAuthenticated ? <ArrowForward sx={{ fontSize: 16 }} /> : <Lock sx={{ fontSize: 16 }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestrictedAction(`/package/${encodeURIComponent(pkg.name)}`);
                          }}
                          sx={{
                            mt: 2.5,
                            borderColor: '#C9A961',
                            color: '#1B2A3D',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 2,
                            '&:hover': {
                              backgroundColor: '#C9A961',
                              borderColor: '#C9A961',
                              color: 'white',
                            }
                          }}
                        >
                          {isAuthenticated ? 'View Package Details' : 'Sign In to View Details'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}

          {packages.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={isAuthenticated ? <ArrowForward /> : <Lock sx={{ fontSize: 18 }} />}
                onClick={() => handleRestrictedAction('/packages')}
                className="btn-primary"
                sx={{ px: 4, py: 1.3 }}
              >
                {isAuthenticated ? 'View All Packages' : 'Sign In to View All Packages'}
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Services Section */}
      <Box id="services-section" className="services-section section">
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            align="center"
            className="section-title"
            sx={{ 
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              mb: 5,
              color: 'white'
            }}
          >
            Our Services
          </Typography>
          <Grid container spacing={3}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={index}>
                <Fade in={true} timeout={800 + index * 150}>
                  <Card 
                    className="service-card"
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login?restricted=true');
                      } else {
                        onServiceClick(service.click);
                        navigate('/packages');
                      }
                    }}
                    sx={{ 
                      cursor: 'pointer',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)'
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Box 
                        sx={{ 
                          mb: 2.5,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 90,
                          height: 90,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #C9A961 0%, #D4B97A 100%)',
                          color: 'white',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(201, 169, 97, 0.3)',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          }
                        }}
                      >
                        {service.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: '"Playfair Display", serif',
                          fontWeight: 600,
                          mb: 1.5,
                          color: '#1B2A3D',
                          fontSize: '1rem'
                        }}
                      >
                        {service.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#5A6C7D',
                          lineHeight: 1.6,
                          fontSize: '0.85rem'
                        }}
                      >
                        {service.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box className="cta-section section">
        <Container maxWidth="lg">
          <Box className="cta-content">
            <Typography 
              variant="h3" 
              sx={{ 
                fontFamily: '"Playfair Display", serif',
                fontWeight: 600,
                mb: 3,
                color: 'white'
              }}
            >
              Ready to Plan a Meaningful Farewell?
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4,
                color: 'rgba(255, 255, 255, 0.85)',
                maxWidth: 600,
                mx: 'auto',
                fontSize: '1.05rem',
                lineHeight: 1.7
              }}
            >
              Let us help you create a beautiful tribute that honors your loved one's memory with dignity and grace.
            </Typography>
            <Button 
              onClick={() => handleRestrictedAction('/contact-us')}
              variant="contained"
              size="large"
              className="btn-secondary"
              endIcon={isAuthenticated ? <ArrowForward /> : <Lock sx={{ fontSize: 18 }} />}
              sx={{ 
                px: 5,
                py: 1.5,
                fontSize: '1.05rem'
              }}
            >
              {isAuthenticated ? 'Get Started Today' : 'Sign In to Get Started'}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;