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
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    maxWidth: 700,
                    mb: 4,
                    color: 'rgba(255, 255, 255, 0.9)',
                    mx: 'auto'
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
              color: '#1B2A3D'
            }}
          >
            Contact Information
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                icon: <LocationOn sx={{ fontSize: 45 }} />,
                title: 'Our Location',
                details: ['123 Memorial Ave, Serenity City', 'Sri Lanka']
              },
              {
                icon: <Phone sx={{ fontSize: 45 }} />,
                title: 'Phone',
                details: ['+94 112 345 678', '+94 112 987 654', 'Available 24/7']
              },
              {
                icon: <Email sx={{ fontSize: 45 }} />,
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
                          width: 90,
                          height: 90,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1B2A3D 0%, #243648 100%)',
                          color: '#C9A961',
                          boxShadow: '0 8px 24px rgba(27, 42, 61, 0.2)',
                          transition: 'all 0.3s ease'
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
                          color: '#1B2A3D',
                          fontSize: '1.1rem'
                        }}
                      >
                        {item.title}
                      </Typography>
                      {item.details.map((detail, idx) => (
                        <Typography 
                          key={idx}
                          variant="body2" 
                          sx={{ 
                            color: '#5A6C7D',
                            mb: 0.5,
                            lineHeight: 1.6,
                            fontSize: '0.9rem'
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
                      color: '#1B2A3D'
                    }}
                  >
                    Send Us a Message
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#5A6C7D',
                      lineHeight: 1.8,
                      mb: 4,
                      fontSize: '1.05rem'
                    }}
                  >
                    Have questions about our services or need assistance with arrangements? Fill out the form below and our compassionate team will get back to you as soon as possible.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Spa sx={{ fontSize: 36, mr: 2, color: '#C9A961' }} />
                    <Typography variant="h6" sx={{ color: '#1B2A3D', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
                      Eternal Rest
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#5A6C7D', lineHeight: 1.7 }}>
                    Providing compassionate care and support during life's most difficult moments.
                  </Typography>
                </Box>
              </Slide>
            </Grid>
            <Grid item xs={12} md={6}>
              <Slide direction="left" in={true} timeout={1000}>
                <Card className="form-card">
                  <CardContent sx={{ p: { xs: 3, md: 5 } }}>
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
                              '& fieldset': { borderColor: '#E8E4DF' },
                              '&:hover fieldset': { borderColor: '#C9A961' },
                              '&.Mui-focused fieldset': { borderColor: '#C9A961', borderWidth: 2 },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#C9A961' },
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
                              '& fieldset': { borderColor: '#E8E4DF' },
                              '&:hover fieldset': { borderColor: '#C9A961' },
                              '&.Mui-focused fieldset': { borderColor: '#C9A961', borderWidth: 2 },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#C9A961' },
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
                              '& fieldset': { borderColor: '#E8E4DF' },
                              '&:hover fieldset': { borderColor: '#C9A961' },
                              '&.Mui-focused fieldset': { borderColor: '#C9A961', borderWidth: 2 },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#C9A961' },
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
                              '& fieldset': { borderColor: '#E8E4DF' },
                              '&:hover fieldset': { borderColor: '#C9A961' },
                              '&.Mui-focused fieldset': { borderColor: '#C9A961', borderWidth: 2 },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#C9A961' },
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
                            borderRadius: '50px',
                            background: 'linear-gradient(135deg, #C9A961 0%, #D4B97A 100%)',
                            color: '#1B2A3D',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #D4B97A 0%, #C9A961 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 15px rgba(201, 169, 97, 0.4)',
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
              color: '#1B2A3D'
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
              style={{ border: 0, borderRadius: '16px' }}
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
