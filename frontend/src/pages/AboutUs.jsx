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
      icon: <Spa sx={{ fontSize: 60 }} />,
      title: 'Compassion',
      description: 'We approach every family with empathy and understanding during their time of need.'
    },
    {
      icon: <Favorite sx={{ fontSize: 60 }} />,
      title: 'Dignity',
      description: 'We ensure every service honors the life and legacy of your loved one with respect.'
    },
    {
      icon: <Groups sx={{ fontSize: 60 }} />,
      title: 'Community',
      description: 'We are committed to serving our community with integrity and dedication.'
    },
    {
      icon: <BusinessCenter sx={{ fontSize: 60 }} />,
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
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    maxWidth: 700,
                    mb: 4,
                    color: 'rgba(255, 255, 255, 0.95)'
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
                      color: '#2c3e50'
                    }}
                  >
                    Our Story
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#5a6c7d',
                      lineHeight: 1.8,
                      mb: 3,
                      fontSize: '1.1rem'
                    }}
                  >
                    Memorial Services Hub was founded with a simple yet profound mission: to provide compassionate, dignified funeral services that honor the lives of those we serve. As a family-operated business with a legacy of excellence, we understand the importance of creating meaningful farewells.
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#5a6c7d',
                      lineHeight: 1.8,
                      fontSize: '1.1rem'
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
                  <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80" alt="Our Story" loading="lazy" />
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
              color: '#2c3e50'
            }}
          >
            Our Values
          </Typography>
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in={true} timeout={800 + index * 200}>
                  <Card className="value-card">
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
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
                        {value.icon}
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
                        {value.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#5a6c7d',
                          lineHeight: 1.6
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
              color: '#2c3e50'
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
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #c9a961 0%, #8b7355 100%)',
                          color: 'white'
                        }}
                      >
                        {member.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: '"Playfair Display", serif',
                          fontWeight: 600,
                          mb: 1,
                          color: '#2c3e50'
                        }}
                      >
                        {member.name}
                      </Typography>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          color: '#8b7355',
                          mb: 2,
                          fontWeight: 500
                        }}
                      >
                        {member.role}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#5a6c7d',
                          lineHeight: 1.6
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
