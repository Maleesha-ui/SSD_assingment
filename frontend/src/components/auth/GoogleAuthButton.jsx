import React from 'react';
import { Button, CircularProgress } from '@mui/material';

// Official multi-color Google SVG icon
export const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '12px', flexShrink: 0 }}>
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

const GoogleAuthButton = ({ 
  text = 'Continue with Google', 
  loading = false, 
  onClick 
}) => {
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    // Default flow: trigger Passport Google OAuth on backend
    window.location.href = `${backendBaseUrl}/api/auth/google`;
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      size="large"
      onClick={handleClick}
      disabled={loading}
      sx={{
        py: 1.4,
        px: 3,
        fontSize: '0.95rem',
        fontWeight: 600,
        borderRadius: '50px',
        borderColor: '#E8E4DF',
        color: '#1B2A3D',
        backgroundColor: '#FFFFFF',
        textTransform: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(27, 42, 61, 0.06)',
        transition: 'all 0.25s ease',
        '&:hover': {
          borderColor: '#C9A961',
          backgroundColor: '#FCFAF7',
          boxShadow: '0 4px 14px rgba(201, 169, 97, 0.2)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      {loading ? (
        <CircularProgress size={22} sx={{ color: '#C9A961' }} />
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
