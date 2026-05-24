import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, TextField, Button, Fade, Slide } from '@mui/material';
import { Email, Phone, LocationOn, Send, Spa } from '@mui/icons-material';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <Box className="contact-container">
      {/* Hero Section */}
      <Box className="contact-hero">
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
                    mb: 3,
                    color: 'white'
                  }}
                >
                  Get in Touch
                </Typography>
                <Typography 
                  variant="h5" 
                  className="hero-subtitle"
                  sx={{ 
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    maxWidth: 700,
                    mb: 4,
                    color: 'rgba(255, 255, 255, 0.95)'
                  }}
                >
                  We're here to help you during life's most difficult moments. Reach out to us with any questions or concerns.
                </Typography>
              </Box>
            </Fade>
          </Container>
        </Box>
      </Box>

      {/* Contact Information Section */}
      <Box className="contact-info-section section">
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            align="center"
            className="section-title"
            sx={{ 
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              mb: 5,
              color: '#2c3e50'
            }}
          >
            Contact Information
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                icon: <LocationOn sx={{ fontSize: 50 }} />,
                title: 'Our Location',
                details: ['123 Memorial Ave, Serenity City', 'Sri Lanka']
              },
              {
                icon: <Phone sx={{ fontSize: 50 }} />,
                title: 'Phone',
                details: ['+94 112 345 678', '+94 112 987 654', 'Available 24/7']
              },
              {
                icon: <Email sx={{ fontSize: 50 }} />,
                title: 'Email',
                details: ['info@eternalrest.com', 'support@eternalrest.com']
              }
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in={true} timeout={800 + index * 200}>
                  <Card className="contact-card">
                    <CardContent sx={{ textAlign: 'center', py: 5 }}>
                      <Box 
                        sx={{ 
                          mb: 3,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #c9a961 0%, #8b7355 100%)',
                          color: 'white'
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: '"Playfair Display", serif',
                          fontWeight: 600,
                          mb: 2,
                          color: '#2c3e50'
                        }}
                      >
                        {item.title}
                      </Typography>
                      {item.details.map((detail, idx) => (
                        <Typography 
                          key={idx}
                          variant="body2" 
                          sx={{ 
                            color: '#5a6c7d',
                            mb: 1,
                            lineHeight: 1.6
                          }}
                        >
                          {detail}
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Form Section */}
      <Box className="contact-form-section section">
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Slide direction="right" in={true} timeout={1000}>
                <Box>
                  <Typography 
                    variant="h2" 
                    className="section-title"
                    sx={{ 
                      fontFamily: '"Playfair Display", serif',
                      fontWeight: 600,
                      mb: 3,
                      color: '#2c3e50'
                    }}
                  >
                    Send Us a Message
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#5a6c7d',
                      lineHeight: 1.8,
                      mb: 4,
                      fontSize: '1.1rem'
                    }}
                  >
                    Have questions about our services or need assistance with arrangements? Fill out the form below and our compassionate team will get back to you as soon as possible.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Spa sx={{ fontSize: 40, mr: 2, color: '#c9a961' }} />
                    <Typography variant="h6" sx={{ color: '#8b7355', fontWeight: 600 }}>
                      Eternal Rest
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#5a6c7d', lineHeight: 1.7 }}>
                    Providing compassionate care and support during life's most difficult moments.
                  </Typography>
                </Box>
              </Slide>
            </Grid>
            <Grid item xs={12} md={6}>
              <Slide direction="left" in={true} timeout={1000}>
                <Card className="form-card">
                  <CardContent sx={{ p: 5 }}>
                    <form onSubmit={handleSubmit}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                          fullWidth
                          label="Your Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '& fieldset': {
                                borderColor: '#e9ecef',
                              },
                              '&:hover fieldset': {
                                borderColor: '#8b7355',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#8b7355',
                                borderWidth: 2,
                              },
                            },
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Email Address"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '& fieldset': {
                                borderColor: '#e9ecef',
                              },
                              '&:hover fieldset': {
                                borderColor: '#8b7355',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#8b7355',
                                borderWidth: 2,
                              },
                            },
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '& fieldset': {
                                borderColor: '#e9ecef',
                              },
                              '&:hover fieldset': {
                                borderColor: '#8b7355',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#8b7355',
                                borderWidth: 2,
                              },
                            },
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Your Message"
                          multiline
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '& fieldset': {
                                borderColor: '#e9ecef',
                              },
                              '&:hover fieldset': {
                                borderColor: '#8b7355',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#8b7355',
                                borderWidth: 2,
                              },
                            },
                          }}
                        />
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          fullWidth
                          endIcon={<Send />}
                          sx={{
                            py: 1.8,
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #c9a961 0%, #8b7355 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #8b7355 0%, #c9a961 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(201, 169, 97, 0.4)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Send Message
                        </Button>
                      </Box>
                    </form>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Map Section */}
      <Box className="map-section section">
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            align="center"
            className="section-title"
            sx={{ 
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              mb: 5,
              color: '#2c3e50'
            }}
          >
            Find Us
          </Typography>
          <Box className="map-container">
            <iframe
              title="Head Office Location"
              src="https://maps.google.com/maps?q=6.915202029177645,79.97222615966794&z=15&output=embed"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '20px' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ContactUs;
