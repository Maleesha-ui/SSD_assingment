import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Container, Fade } from '@mui/material';
import { Spa } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AuthCallback = () => {
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('Verifying secure authorization...');
  const location = useLocation();
  const navigate = useNavigate();
  const { applyAuthSession } = useAuth();
  const exchangeAttempted = useRef(false);

  useEffect(() => {
    // Prevent duplicate execution under React StrictMode
    if (exchangeAttempted.current) return;

    const handleAuth = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const errParam = params.get('error');

        // Invariant 1 & 16: Immediate URL scrubbing via replaceState before rendering or storage
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, '', '/auth/callback');
        }

        if (errParam) {
          setError('Google authentication was cancelled or failed. Please try again.');
          setTimeout(() => navigate('/login'), 2500);
          return;
        }

        if (!code) {
          // If no code, check if authenticated via HttpOnly cookie (Pattern A)
          try {
            const meRes = await api.get('/auth/me');
            const user = meRes.data;
            applyAuthSession(null, user);
            if (!user.isProfileComplete) {
              navigate('/complete-profile');
            } else if (user.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/dashboard');
            }
            return;
          } catch {
            setError('Authorization code missing. Please sign in again.');
            setTimeout(() => navigate('/login'), 2500);
            return;
          }
        }

        exchangeAttempted.current = true;
        setStatusMessage('Exchanging one-time authorization code securely...');

        // Invariant 4: Retrieve PKCE codeVerifier bound during OAuth initiation
        const codeVerifier = sessionStorage.getItem('oauth_code_verifier') || '';
        const redirectUri = `${window.location.origin}/auth/callback`;

        // Exchange code via POST request (body only, no bearer tokens in URL)
        const response = await api.post('/auth/oauth/exchange', {
          code,
          codeVerifier,
          redirectUri,
        });

        // Clean up transient PKCE secrets from storage
        sessionStorage.removeItem('oauth_code_verifier');
        sessionStorage.removeItem('oauth_state');

        const { accessToken, user, isProfileComplete } = response.data;
        applyAuthSession(accessToken, user);

        // Check if user needs to complete profile
        if (!isProfileComplete) {
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
        console.error('OAuth exchange error:', err);
        sessionStorage.removeItem('oauth_code_verifier');
        sessionStorage.removeItem('oauth_state');
        setError(err.response?.data?.message || 'Failed to complete Google authentication.');
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
            aria-live="polite"
            sx={{
              color: '#5A6C7D',
              fontFamily: '"Inter", sans-serif',
              mb: 4,
            }}
          >
            {error ? error : statusMessage}
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
