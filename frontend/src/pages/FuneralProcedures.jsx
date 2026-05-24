import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Fade, Slide } from '@mui/material';
import { LocalHospital, Description, Phone, Assignment, LocalShipping, HealthAndSafety } from '@mui/icons-material';
import './FuneralProcedures.css';

const FuneralProcedures = () => {
  const steps = [
    {
      icon: <LocalHospital sx={{ fontSize: 60 }} />,
      title: 'Step 1: Contacting the Medical Authorities',
      description: 'The first thing you should do when a death occurs is contacting the necessary medical authorities related to the death.'
    },
    {
      icon: <Description sx={{ fontSize: 60 }} />,
      title: 'Step 2: Obtaining the Medical Certificate',
      description: 'After contacting the medical authorities, obtain the medical certificate which confirms the death.'
    },
    {
      icon: <Phone sx={{ fontSize: 60 }} />,
      title: 'Step 3: Contacting the Funeral Home',
      description: 'With the medical certificate in hand, contact the selected funeral home to arrange for further proceedings.'
    },
    {
      icon: <Assignment sx={{ fontSize: 60 }} />,
      title: 'Step 4: Selection of Funeral Package',
      description: 'With the assistance of the funeral home\'s management, select and book the preferred funeral package and make the required payments.'
    },
    {
      icon: <LocalShipping sx={{ fontSize: 60 }} />,
      title: 'Step 5: Handing Over the Body of the Deceased',
      description: 'The body of the deceased will be sent to the funeral service for preparation once the funeral package is selected.'
    },
    {
      icon: <HealthAndSafety sx={{ fontSize: 60 }} />,
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
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    maxWidth: 800,
                    mb: 4,
                    color: 'rgba(255, 255, 255, 0.95)'
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
              color: '#5a6c7d',
              lineHeight: 1.9,
              mb: 3,
              fontSize: '1.15rem',
              textAlign: 'center'
            }}
          >
            Losing a loved one is a deeply emotional experience, and many individuals are uncertain about the next steps, whom to contact, and the essential procedures to follow. In Sri Lanka, there is a lack of awareness about these crucial steps. As a leader in the funeral service industry, we provide expert guidance and knowledge to help families navigate this difficult time with ease and compassion, ensuring a smooth and respectful process.
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#5a6c7d',
              lineHeight: 1.9,
              fontSize: '1.15rem',
              textAlign: 'center'
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
              color: '#2c3e50'
            }}
          >
            Follow These Steps
          </Typography>
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Fade in={true} timeout={800 + index * 150}>
                  <Card className="step-card">
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
                        {step.icon}
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
                        {step.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#5a6c7d',
                          lineHeight: 1.6
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
