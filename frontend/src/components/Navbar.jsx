import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button, useTheme, useMediaQuery, Avatar, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1B2A3D',
  boxShadow: '0 4px 20px rgba(27, 42, 61, 0.15)',
  borderBottom: '1px solid rgba(201, 169, 97, 0.25)',
  padding: theme.spacing(0.5, 2)
}));

const NavLink = styled(Link)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.85)',
  textDecoration: 'none',
  fontWeight: 400,
  fontSize: '0.95rem',
  padding: theme.spacing(1, 2),
  borderRadius: '50px',
  transition: 'all 0.25s ease',
  '&:hover': {
    color: '#ffffff',
    backgroundColor: 'rgba(201, 169, 97, 0.2)'
  }
}));

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <StyledAppBar position="static">
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '0 !important'
      }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h4" 
            component={Link} 
            to="/dashboard" 
            sx={{ 
              textDecoration: 'none',
              color: '#ffffff',
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              letterSpacing: 1,
              '&:hover': {
                color: '#C9A961'
              }
            }}
          >
            Eternal Rest
          </Typography>
        </Box>

        {/* Navigation Links - Desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NavLink to="/">Home</NavLink>
            {user && token && (
              <>
                <NavLink to="/packages">Packages</NavLink>
                <NavLink to="/about-us">About Us</NavLink>
                <NavLink to="/funeral-procedures">Funeral Procedures</NavLink>
                <NavLink to="/contact-us">Contact Us</NavLink>
              </>
            )}
            
            {user && token ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2 }}>
                <Tooltip title={`${user?.name || 'User'} (${user?.role || 'Customer'}) - Dashboard`}>
                  <Avatar
                    src={user?.avatar || ''}
                    alt={user?.name || 'User Avatar'}
                    component={Link}
                    to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      border: '2px solid #C9A961',
                      bgcolor: '#1B2A3D',
                      color: '#C9A961',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(201, 169, 97, 0.35)',
                      fontWeight: 600,
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.08)',
                      }
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </Tooltip>

                <Button
                  onClick={handleLogout}
                  startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    color: '#ffffff',
                    backgroundColor: '#C53030',
                    fontWeight: 600,
                    borderRadius: '50px',
                    border: '1.5px solid #C53030',
                    padding: '6px 18px',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    boxShadow: '0 2px 8px rgba(197, 48, 48, 0.25)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      backgroundColor: '#A82828',
                      borderColor: '#A82828',
                      boxShadow: '0 4px 12px rgba(197, 48, 48, 0.4)',
                    }
                  }}
                >
                  Logout
                </Button>
              </Box>
            ) : (
              <Button
                component={Link}
                to="/login"
                startIcon={<AccountCircle sx={{ color: '#ffffff' }} />}
                sx={{
                  color: '#ffffff',
                  backgroundColor: '#C9A961',
                  marginLeft: 2,
                  fontWeight: 500,
                  borderRadius: '50px',
                  border: '1.5px solid #C9A961',
                  padding: '6px 18px',
                  boxShadow: '0 2px 8px rgba(201, 169, 97, 0.25)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    backgroundColor: '#B5954D',
                    borderColor: '#B5954D',
                    boxShadow: '0 4px 12px rgba(201, 169, 97, 0.4)'
                  }
                }}
              >
                Account
              </Button>
            )}
          </Box>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            color="inherit"
            aria-label="menu"
            sx={{ 
              color: '#C9A961',
              minWidth: 'auto',
              padding: '8px'
            }}
          >
            <MenuIcon />
          </Button>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;