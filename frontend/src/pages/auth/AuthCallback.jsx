import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Container, Fade } from '@mui/material';
import { Spa } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AuthCallback = () => {
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { applyAuthSession } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const errParam = params.get('error');

        if (errParam) {
          setError('Google authentication was cancelled or failed. Please try again.');
          setTimeout(() => navigate('/login'), 2500);
          return;
        }

        if (!token) {
          setError('Authentication token missing. Please try logging in again.');
          setTimeout(() => navigate('/login'), 2500);
          return;
        }

        // Fetch fresh profile from backend with the received token
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = response.data;
        applyAuthSession(token, user);

        // Check if user needs to complete profile
        if (!user.isProfileComplete) {
          navigate('/complete-profile');
          return;
        }

        // Navigate based on verified role
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError(err.response?.data?.message || 'Failed to authenticate with Google.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuth();
  }, [location, navigate, applyAuthSession]);

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
            Verifying Authentication
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#5A6C7D',
              fontFamily: '"Inter", sans-serif',
              mb: 4,
            }}
          >
            Please wait while we securely set up your session...
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

export default AuthCallback;
