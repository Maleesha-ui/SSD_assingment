import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Divider, IconButton, Container, Grid } from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Facebook,
  Twitter,
  Instagram,
  Spa
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#2c3e50',
        color: '#e0e0e0',
        padding: { xs: '4rem 1rem', md: '5rem 2rem' },
        marginTop: 'auto',
        backgroundImage: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%), url("https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1920&q=80") center/cover no-repeat',
        backgroundBlendMode: 'overlay',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(44, 62, 80, 0.92) 0%, rgba(26, 37, 47, 0.95) 100%)',
          zIndex: 0,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Spa sx={{ fontSize: 32, mr: 1.5, color: '#c9a961' }} />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    color: 'white'
                  }}
                >
                  Eternal Rest
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ 
                mb: 3, 
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.85)'
              }}>
                Compassionate funeral services for your loved ones. We provide dignified arrangements with care and respect during life's most difficult moments.
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ mr: 1.5, fontSize: '1.1rem', color: '#c9a961' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>(555) 123-4567</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 1.5, fontSize: '1.1rem', color: '#c9a961' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>contact@eternalrest.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1.5, fontSize: '1.1rem', color: '#c9a961' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>123 Memorial Ave, Serenity City</Typography>
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"Playfair Display", serif',
                fontWeight: 600,
                mb: 3,
                color: 'white'
              }}
            >
              Quick Links
            </Typography>
            <Box 
              component="ul" 
              sx={{ 
                listStyle: 'none', 
                padding: 0,
                '& li': { mb: 2 }
              }}
            >
              <li>
                <Link 
                  to="/about-us" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    fontWeight: 400,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#c9a961'
                    }
                  }}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/packages" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    fontWeight: 400,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Packages
                </Link>
              </li>
              <li>
                <Link 
                  to="/funeral-procedures" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    fontWeight: 400,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Funeral Procedures
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact-us" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    fontWeight: 400,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Contact Us
                </Link>
              </li>
            </Box>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"Playfair Display", serif',
                fontWeight: 600,
                mb: 3,
                color: 'white'
              }}
            >
              Resources
            </Typography>
            <Box 
              component="ul" 
              sx={{ 
                listStyle: 'none', 
                padding: 0,
                '& li': { mb: 2 }
              }}
            >
              <li>
                <Link 
                  to="/faq" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    fontWeight: 400,
                    transition: 'all 0.3s ease'
                  }}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  to="/planning-ahead" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    fontWeight: 400,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Planning Ahead
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal-requirements" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    fontWeight: 400,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Legal Requirements
                </Link>
              </li>
              <li>
                <Link 
                  to="/testimonials" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    fontWeight: 400,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Testimonials
                </Link>
              </li>
            </Box>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"Playfair Display", serif',
                fontWeight: 600,
                mb: 3,
                color: 'white'
              }}
            >
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              <IconButton 
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  '&:hover': { 
                    backgroundColor: '#c9a961',
                    color: 'white',
                    transform: 'translateY(-3px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton 
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  '&:hover': { 
                    backgroundColor: '#c9a961',
                    color: 'white',
                    transform: 'translateY(-3px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton 
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  '&:hover': { 
                    backgroundColor: '#c9a961',
                    color: 'white',
                    transform: 'translateY(-3px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Instagram />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: 1.6
            }}>
              Follow us for updates, resources, and support during difficult times.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ 
          borderColor: 'rgba(255, 255, 255, 0.15)', 
          my: 4
        }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ 
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.85)'
          }}>
            &copy; {new Date().getFullYear()} Eternal Rest Funeral Services. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ 
            fontWeight: 400, 
            mt: 1,
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.85rem'
          }}>
            Licensed by the National Funeral Directors Association | Committed to Excellence in Service
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;