import React from 'react';
import { Button, CircularProgress } from '@mui/material';

// Official multi-color Google SVG icon (18x18px as per Google Identity Guidelines)
export const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '12px', flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

// RFC 7636 PKCE Helpers
const generateRandomString = (length = 64) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  return Array.from(randomValues).map(val => charset[val % charset.length]).join('');
};

const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const GoogleAuthButton = ({ 
  text = 'Continue with Google', 
  loading = false, 
  onClick 
}) => {
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleClick = async (e) => {
    if (onClick) {
      onClick(e);
      return;
    }

    try {
      // Invariant 4: Generate PKCE S256 verifier and challenge
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString(32);

      sessionStorage.setItem('oauth_code_verifier', codeVerifier);
      sessionStorage.setItem('oauth_state', state);

      const redirectUri = `${window.location.origin}/auth/callback`;
      const params = new URLSearchParams({
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: state,
        redirect_uri: redirectUri,
      });

      // Default flow: trigger Passport Google OAuth with PKCE parameters
      window.location.href = `${backendBaseUrl}/api/auth/google?${params.toString()}`;
    } catch (err) {
      console.error('PKCE generation error:', err);
      // Fallback redirect if subtle crypto unavailable
      window.location.href = `${backendBaseUrl}/api/auth/google`;
    }
  };

  return (
    <Button
      fullWidth
      size="large"
      onClick={handleClick}
      disabled={loading}
      sx={{
        py: 1.3,
        px: 3,
        height: '46px',
        fontSize: '0.925rem',
        fontWeight: 500,
        fontFamily: '"Roboto", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        borderRadius: '50px',
        border: '1px solid #dadce0 !important',
        color: '#3c4043 !important',
        backgroundColor: '#ffffff !important',
        backgroundImage: 'none !important',
        textTransform: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        letterSpacing: '0.25px',
        boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15) !important',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          backgroundColor: '#f8f9fa !important',
          borderColor: '#dadce0 !important',
          boxShadow: '0 1px 3px 1px rgba(60, 64, 67, 0.2), 0 2px 8px 2px rgba(60, 64, 67, 0.1) !important',
        },
        '&:focus-visible': {
          backgroundColor: '#ffffff !important',
          outline: '2px solid #4285F4',
          outlineOffset: '2px',
        },
        '&:active': {
          backgroundColor: '#f1f3f4 !important',
          boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.3) !important',
        },
        '&.Mui-disabled': {
          backgroundColor: '#ffffff !important',
          opacity: 0.6,
        },
      }}
    >
      {loading ? (
        <CircularProgress size={20} sx={{ color: '#4285F4' }} />
      ) : (
        <>
          <GoogleIcon />
          <span>{text}</span>
        </>
      )}
    </Button>
  );
};

export default GoogleAuthButton;
