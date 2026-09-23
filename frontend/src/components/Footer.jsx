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
} from '@mui/icons-material';

const Footer = () => {
  const linkStyle = {
    color: 'rgba(255, 255, 255, 0.75)',
    textDecoration: 'none',
    fontWeight: 400,
    transition: 'all 0.3s ease',
    fontSize: '0.95rem',
    display: 'inline-block',
    position: 'relative',
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1B2A3D',
        color: '#e0e0e0',
        padding: { xs: '4rem 1rem', md: '5rem 2rem' },
        marginTop: 'auto',
        background: 'linear-gradient(180deg, #1B2A3D 0%, #111D2B 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle decorative element */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #C9A961 50%, transparent 100%)',
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  color: 'white',
                  mb: 2
                }}
              >
                Eternal Rest
              </Typography>
              <Typography variant="body1" sx={{ 
                mb: 3, 
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.95rem'
              }}>
                Compassionate funeral services for your loved ones. We provide dignified arrangements with care and respect during life's most difficult moments.
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <PhoneIcon sx={{ mr: 1.5, fontSize: '1.1rem', color: '#C9A961' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>(555) 123-4567</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <EmailIcon sx={{ mr: 1.5, fontSize: '1.1rem', color: '#C9A961' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>contact@eternalrest.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1.5, fontSize: '1.1rem', color: '#C9A961' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>123 Memorial Ave, Serenity City</Typography>
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
                color: 'white',
                fontSize: '1.1rem'
              }}
            >
              Quick Links
            </Typography>
            <Box 
              component="ul" 
              sx={{ 
                listStyle: 'none', 
                padding: 0,
                '& li': { mb: 1.5 }
              }}
            >
              {[
                { to: '/about-us', label: 'About Us' },
                { to: '/packages', label: 'Packages' },
                { to: '/funeral-procedures', label: 'Funeral Procedures' },
                { to: '/contact-us', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} style={linkStyle}>{link.label}</Link>
                </li>
              ))}
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
                color: 'white',
                fontSize: '1.1rem'
              }}
            >
              Resources
            </Typography>
            <Box 
              component="ul" 
              sx={{ 
                listStyle: 'none', 
                padding: 0,
                '& li': { mb: 1.5 }
              }}
            >
              {[
                { to: '/faq', label: 'FAQ' },
                { to: '/planning-ahead', label: 'Planning Ahead' },
                { to: '/legal-requirements', label: 'Legal Requirements' },
                { to: '/testimonials', label: 'Testimonials' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} style={linkStyle}>{link.label}</Link>
                </li>
              ))}
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
                color: 'white',
                fontSize: '1.1rem'
              }}
            >
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              {[Facebook, Twitter, Instagram].map((Icon, index) => (
                <IconButton 
                  key={index}
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': { 
                      backgroundColor: '#C9A961',
                      color: 'white',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 4px 15px rgba(201, 169, 97, 0.3)',
                      borderColor: '#C9A961'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Icon />
                </IconButton>
              ))}
            </Box>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.6,
              fontSize: '0.9rem'
            }}>
              Follow us for updates, resources, and support during difficult times.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ 
          borderColor: 'rgba(255, 255, 255, 0.08)', 
          my: 4
        }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ 
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem'
          }}>
            &copy; {new Date().getFullYear()} Eternal Rest Funeral Services. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ 
            fontWeight: 400, 
            mt: 1,
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.8rem'
          }}>
            Licensed by the National Funeral Directors Association | Committed to Excellence in Service
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;