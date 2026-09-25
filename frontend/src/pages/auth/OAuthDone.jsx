import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Container, Fade } from '@mui/material';
import { Spa } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

/**
 * Pattern A: Silent OAuth Done Route
 * Handles cookie-authenticated sessions directly without ANY parameters or tokens in the URL.
 */
const OAuthDone = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { applyAuthSession } = useAuth();

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        // Fetch user profile using HttpOnly cookie (credentials: 'include')
        const response = await api.get('/auth/me');
        const user = response.data;

        applyAuthSession(null, user);

        if (!user.isProfileComplete) {
          navigate('/complete-profile');
        } else if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Session hydration error:', err);
        setError('Failed to establish authenticated session. Please try logging in again.');
        setTimeout(() => navigate('/login'), 2500);
      }
    };

    hydrateSession();
  }, [navigate, applyAuthSession]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F6F3',
        p: 3,
      }}
    >
      <Fade in={true} timeout={600}>
        <Container maxWidth="xs" sx={{ textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <Spa sx={{ fontSize: 64, color: '#C9A961' }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              color: '#1B2A3D',
              mb: 2,
            }}
          >
            Session Established
          </Typography>
          <Typography
            variant="body1"
            aria-live="polite"
            sx={{
              color: '#5A6C7D',
              fontFamily: '"Inter", sans-serif',
              mb: 4,
            }}
          >
            {error || 'Redirecting to your dashboard...'}
          </Typography>

          {error ? (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
                backgroundColor: '#FFF5F5',
                color: '#C53030',
                border: '1px solid #FED7D7',
              }}
            >
              {error}
            </Alert>
          ) : (
            <CircularProgress sx={{ color: '#C9A961' }} size={40} thickness={4} />
          )}
        </Container>
      </Fade>
    </Box>
  );
};

export default OAuthDone;
