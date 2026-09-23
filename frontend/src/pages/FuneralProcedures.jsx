import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Fade, Slide } from '@mui/material';
import { LocalHospital, Description, Phone, Assignment, LocalShipping, HealthAndSafety } from '@mui/icons-material';
import './FuneralProcedures.css';

const FuneralProcedures = () => {
  const steps = [
    {
      icon: <LocalHospital sx={{ fontSize: 50 }} />,
      title: 'Step 1: Contacting the Medical Authorities',
      description: 'The first thing you should do when a death occurs is contacting the necessary medical authorities related to the death.'
    },
    {
      icon: <Description sx={{ fontSize: 50 }} />,
      title: 'Step 2: Obtaining the Medical Certificate',
      description: 'After contacting the medical authorities, obtain the medical certificate which confirms the death.'
    },
    {
      icon: <Phone sx={{ fontSize: 50 }} />,
      title: 'Step 3: Contacting the Funeral Home',
      description: 'With the medical certificate in hand, contact the selected funeral home to arrange for further proceedings.'
    },
    {
      icon: <Assignment sx={{ fontSize: 50 }} />,
      title: 'Step 4: Selection of Funeral Package',
      description: 'With the assistance of the funeral home\'s management, select and book the preferred funeral package and make the required payments.'
    },
    {
      icon: <LocalShipping sx={{ fontSize: 50 }} />,
      title: 'Step 5: Handing Over the Body of the Deceased',
      description: 'The body of the deceased will be sent to the funeral service for preparation once the funeral package is selected.'
    },
    {
      icon: <HealthAndSafety sx={{ fontSize: 50 }} />,
      title: 'Step 6: Special Steps to Follow',
      description: 'Due to the COVID-19 guidelines, certain changes have been made in the procedures. The PHI in charge must be notified, and a PCR test may be required depending on the situation.'
    }
  ];

  return (
    <Box className="procedures-container">
      {/* Hero Section */}
      <Box className="procedures-hero">
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
                  Funeral Procedures
                </Typography>
                <Typography 
                  variant="h5" 
                  className="hero-subtitle"
                  sx={{ 
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    maxWidth: 800,
                    mb: 4,
                    color: 'rgba(255, 255, 255, 0.9)',
                    mx: 'auto'
                  }}
                >
                  Losing a loved one is a deeply emotional experience. We provide expert guidance to help families navigate this difficult time with ease and compassion.
                </Typography>
              </Box>
            </Fade>
          </Container>
        </Box>
      </Box>

      {/* Introduction Section */}
      <Box className="intro-section section">
        <Container maxWidth="lg">
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#5A6C7D',
              lineHeight: 1.9,
              mb: 3,
              fontSize: '1.1rem',
              textAlign: 'center',
              maxWidth: 900,
              mx: 'auto'
            }}
          >
            Losing a loved one is a deeply emotional experience, and many individuals are uncertain about the next steps, whom to contact, and the essential procedures to follow. In Sri Lanka, there is a lack of awareness about these crucial steps. As a leader in the funeral service industry, we provide expert guidance and knowledge to help families navigate this difficult time with ease and compassion, ensuring a smooth and respectful process.
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#5A6C7D',
              lineHeight: 1.9,
              fontSize: '1.1rem',
              textAlign: 'center',
              maxWidth: 900,
              mx: 'auto'
            }}
          >
            Therefore, we are here to guide you through each step you should follow in such a situation to make it a hassle-free and smooth operation.
          </Typography>
        </Container>
      </Box>

      {/* Steps Section */}
      <Box className="steps-section section">
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
            Follow These Steps
          </Typography>
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Fade in={true} timeout={800 + index * 150}>
                  <Card className="step-card">
                    <CardContent sx={{ textAlign: 'center', py: 5, px: 3 }}>
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
                        {step.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: '"Playfair Display", serif',
                          fontWeight: 600,
                          mb: 2,
                          color: '#1B2A3D',
                          fontSize: '1.05rem'
                        }}
                      >
                        {step.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#5A6C7D',
                          lineHeight: 1.6,
                          fontSize: '0.9rem'
                        }}
                      >
                        {step.description}
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

export default FuneralProcedures;
