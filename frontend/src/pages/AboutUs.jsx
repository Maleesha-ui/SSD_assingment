import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Fade, Slide } from '@mui/material';
import { Spa, BusinessCenter, Groups, Favorite } from '@mui/icons-material';
import './AboutUs.css';

const AboutUs = () => {
  const teamMembers = [
    {
      name: 'Ahan Res',
      role: 'CEO',
      description: 'Memorial Services Hub is dedicated to honoring life with dignity and compassion. We provide personalized memorial services, from prearrangement planning to customized ceremonies, ensuring the highest standards of care and quality.',
      icon: <BusinessCenter sx={{ fontSize: 50 }} />
    },
    {
      name: 'Naswim Allam',
      role: 'CTO',
      description: 'Memorial Services Hub is a leader in the funeral service industry, offering innovative and compassionate services to ensure dignified farewells for loved ones. With a dedicated team and a wide network of locations.',
      icon: <Groups sx={{ fontSize: 50 }} />
    },
    {
      name: 'Rassw Maher',
      role: 'Lead Developer',
      description: 'Memorial Services Hub is transforming the funeral service industry by offering innovative, high-quality services to honor loved ones with respect and care. We provide state-of-the-art memorial parlors.',
      icon: <Favorite sx={{ fontSize: 50 }} />
    }
  ];

  const values = [
    {
      icon: <Spa sx={{ fontSize: 50 }} />,
      title: 'Compassion',
      description: 'We approach every family with empathy and understanding during their time of need.'
    },
    {
      icon: <Favorite sx={{ fontSize: 50 }} />,
      title: 'Dignity',
      description: 'We ensure every service honors the life and legacy of your loved one with respect.'
    },
    {
      icon: <Groups sx={{ fontSize: 50 }} />,
      title: 'Community',
      description: 'We are committed to serving our community with integrity and dedication.'
    },
    {
      icon: <BusinessCenter sx={{ fontSize: 50 }} />,
      title: 'Excellence',
      description: 'We maintain the highest standards in every aspect of our service.'
    }
  ];

  return (
    <Box className="about-container">
      {/* Hero Section */}
      <Box className="about-hero">
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
                  About Us
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
                  We are a dedicated team passionate about delivering the best services. Our goal is to provide high-quality solutions tailored to your needs.
                </Typography>
              </Box>
            </Fade>
          </Container>
        </Box>
      </Box>

      {/* Our Story Section */}
      <Box className="story-section section">
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
                    Our Story
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#5A6C7D',
                      lineHeight: 1.8,
                      mb: 3,
                      fontSize: '1.05rem'
                    }}
                  >
                    Memorial Services Hub was founded with a simple yet profound mission: to provide compassionate, dignified funeral services that honor the lives of those we serve. As a family-operated business with a legacy of excellence, we understand the importance of creating meaningful farewells.
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#5A6C7D',
                      lineHeight: 1.8,
                      fontSize: '1.05rem'
                    }}
                  >
                    Our commitment extends beyond the final farewell. We continue to assist families throughout their journey, offering guidance, comfort, and unwavering support—because honoring a life is more than just a service; it's a heartfelt commitment.
                  </Typography>
                </Box>
              </Slide>
            </Grid>
            <Grid item xs={12} md={6}>
              <Slide direction="left" in={true} timeout={1000}>
                <Box className="story-image">
                  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80" alt="Our Story" loading="lazy" />
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Our Values Section */}
      <Box className="values-section section">
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
            Our Values
          </Typography>
          <Grid container spacing={3}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in={true} timeout={800 + index * 200}>
                  <Card className="value-card">
                    <CardContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
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
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #C9A961 0%, #D4B97A 100%)',
                            color: 'white',
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        {value.icon}
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
                        {value.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#5A6C7D',
                          lineHeight: 1.6,
                          fontSize: '0.9rem'
                        }}
                      >
                        {value.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Box className="team-section section">
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
            Meet Our Team
          </Typography>
          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in={true} timeout={800 + index * 200}>
                  <Card className="team-card">
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
                          boxShadow: '0 8px 24px rgba(27, 42, 61, 0.2)'
                        }}
                      >
                        {member.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: '"Playfair Display", serif',
                          fontWeight: 600,
                          mb: 0.5,
                          color: '#1B2A3D'
                        }}
                      >
                        {member.name}
                      </Typography>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          color: '#C9A961',
                          mb: 2,
                          fontWeight: 600,
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          fontSize: '0.75rem'
                        }}
                      >
                        {member.role}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#5A6C7D',
                          lineHeight: 1.6,
                          fontSize: '0.9rem'
                        }}
                      >
                        {member.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutUs;
